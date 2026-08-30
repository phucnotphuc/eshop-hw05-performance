/*
 * HW05 JMeter test-plan generator — 23127249
 * Emits 3 .jmx files (Load / Stress / Spike) sharing ONE end-to-end workflow:
 *   login(auth) -> browse+search+detail(read) -> cart+coupon+checkout(transactional)
 * Each scenario differs only in thread config + listener type (3 distinct views).
 *
 * Run:  node generate_plans.js
 */
const fs = require('fs');
const path = require('path');
const DATE = '20260830';
const SID = '23127249';

// data dir is ../data relative to the .jmx at run time (JMeter resolves against plan file)
const CSV_USERS   = '../data/users.csv';
const CSV_PROD    = '../data/products.csv';
const CSV_COUPON  = '../data/coupons.csv';

// ---- per-scenario config -------------------------------------------------
const scenarios = {
  Load:   { threads: 50,  ramp: 60,  duration: 600, loops: -1, think:[1000,2000],
            listener:'SummaryReport',   listenerClass:'SummaryReport',
            note:'Normal expected load: 50 VU, 60s ramp, 10 min steady.' },
  Stress: { threads: 300, ramp: 180, duration: 360, loops: -1, think:[300,700],
            listener:'StatVisualizer',  listenerClass:'StatVisualizer',   // Aggregate Report
            note:'Ramp 0->300 VU over 180s to find breaking point.' },
  Spike:  { threads: 200, ramp: 3,   duration: 90,  loops: -1, think:[100,300],
            listener:'ViewResultsFullVisualizer', listenerClass:'ViewResultsFullVisualizer', // View Results Tree
            note:'Sudden burst: 200 VU in 3s, hold 90s.' },
};

// ---- xml helpers ---------------------------------------------------------
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const boolProp = (n,v)=>`<boolProp name="${n}">${v}</boolProp>`;
const strProp  = (n,v)=>`<stringProp name="${n}">${esc(v)}</stringProp>`;

function csvConfig(name, file, vars){
  return `<CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="CSV ${name}" enabled="true">
  ${strProp('filename', file)}
  ${strProp('fileEncoding','UTF-8')}
  ${strProp('variableNames', vars)}
  ${boolProp('ignoreFirstLine','true')}
  ${strProp('delimiter',',')}
  ${boolProp('quotedData','false')}
  ${boolProp('recycle','true')}
  ${boolProp('stopThread','false')}
  ${strProp('shareMode','shareMode.all')}
</CSVDataSet>
<hashTree/>`;
}

// HTTP sampler. method GET/POST. path. body(optional JSON).
function httpSampler(testname, method, pathStr, body){
  const argsBlock = body ?
    `<elementProp name="HTTPsampler.Arguments" elementType="Arguments">
       <collectionProp name="Arguments.arguments">
         <elementProp name="" elementType="HTTPArgument">
           ${boolProp('HTTPArgument.always_encode','false')}
           ${strProp('Argument.value', body)}
           ${strProp('Argument.metadata','=')}
         </elementProp>
       </collectionProp>
     </elementProp>` :
    `<elementProp name="HTTPsampler.Arguments" elementType="Arguments">
       <collectionProp name="Arguments.arguments"/>
     </elementProp>`;
  return `<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${esc(testname)}" enabled="true">
  ${argsBlock}
  ${strProp('HTTPSampler.domain','${BASE_HOST}')}
  ${strProp('HTTPSampler.port','${BASE_PORT}')}
  ${strProp('HTTPSampler.protocol','http')}
  ${strProp('HTTPSampler.path', pathStr)}
  ${strProp('HTTPSampler.method', method)}
  ${boolProp('HTTPSampler.follow_redirects','true')}
  ${boolProp('HTTPSampler.use_keepalive','true')}
  ${boolProp('HTTPSampler.postBodyRaw', body? 'true':'false')}
</HTTPSamplerProxy>`;
}

function respAssertion(testname, contains){
  return `<ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assert ${esc(testname)}" enabled="true">
  <collectionProp name="Asserion.test_strings">
    <stringProp name="chk">${esc(contains)}</stringProp>
  </collectionProp>
  ${strProp('Assertion.custom_message','')}
  ${strProp('Assertion.test_field','Assertion.response_data')}
  ${boolProp('Assertion.assume_success','false')}
  <intProp name="Assertion.test_type">16</intProp>
</ResponseAssertion>
<hashTree/>`;
}

function codeAssertion(testname, code){
  return `<ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Status ${esc(testname)}" enabled="true">
  <collectionProp name="Asserion.test_strings">
    <stringProp name="cd">${code}</stringProp>
  </collectionProp>
  ${strProp('Assertion.custom_message','Unexpected HTTP status')}
  ${strProp('Assertion.test_field','Assertion.response_code')}
  ${boolProp('Assertion.assume_success','false')}
  <intProp name="Assertion.test_type">8</intProp>
</ResponseAssertion>
<hashTree/>`;
}

function jsonExtractor(name, jsonPath, refName){
  return `<JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract ${name}" enabled="true">
  ${strProp('JSONPostProcessor.referenceNames', refName)}
  ${strProp('JSONPostProcessor.jsonPathExprs', jsonPath)}
  ${strProp('JSONPostProcessor.match_numbers','1')}
  ${strProp('JSONPostProcessor.defaultValues','NOTFOUND')}
</JSONPostProcessor>
<hashTree/>`;
}

function headerManager(withAuth){
  const auth = withAuth ?
    `<elementProp name="" elementType="Header">
       ${strProp('Header.name','Authorization')}
       ${strProp('Header.value','Bearer ${authToken}')}
     </elementProp>` : '';
  return `<HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="Headers" enabled="true">
  <collectionProp name="HeaderManager.headers">
    <elementProp name="" elementType="Header">
      ${strProp('Header.name','Content-Type')}
      ${strProp('Header.value','application/json')}
    </elementProp>
    ${auth}
  </collectionProp>
</HeaderManager>
<hashTree/>`;
}

function timer(min,max){
  const range = max-min;
  return `<UniformRandomTimer guiclass="UniformRandomTimerGui" testclass="UniformRandomTimer" testname="Think ${min}-${max}ms" enabled="true">
  ${strProp('ConstantTimer.delay', String(min))}
  ${strProp('RandomTimer.range', String(range))}
</UniformRandomTimer>
<hashTree/>`;
}

function listener(cfg, sid, scen){
  const jtl = `${sid}_${scen}_${DATE}.jtl`;
  return `<ResultCollector guiclass="${cfg.listener}" testclass="ResultCollector" testname="${cfg.listener}" enabled="true">
  ${boolProp('ResultCollector.error_logging','false')}
  <objProp>
    <name>saveConfig</name>
    <value class="SampleSaveConfiguration">
      <time>true</time><latency>true</latency><timestamp>true</timestamp><success>true</success>
      <label>true</label><code>true</code><message>true</message><threadName>true</threadName>
      <dataType>true</dataType><encoding>false</encoding><assertions>true</assertions>
      <subresults>true</subresults><responseData>false</responseData><samplerData>false</samplerData>
      <xml>false</xml><fieldNames>true</fieldNames><responseHeaders>false</responseHeaders>
      <requestHeaders>false</requestHeaders><responseDataOnError>true</responseDataOnError>
      <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
      <assertionsResultsToSave>0</assertionsResultsToSave><bytes>true</bytes>
      <sentBytes>true</sentBytes><threadCounts>true</threadCounts><idleTime>true</idleTime>
      <connectTime>true</connectTime>
    </value>
  </objProp>
  ${strProp('filename', jtl)}
</ResultCollector>
<hashTree/>`;
}

function buildPlan(scen, cfg){
  const t = cfg.think;
  const steps = [
    // 1. LOGIN (auth-heavy)
    httpSampler('01 Login (auth)','POST','/api/login',
      '{"email":"${email}","password":"${password}"}'),
    `<hashTree>
       ${jsonExtractor('token','$.token','authToken')}
       ${jsonExtractor('userId','$.user.id','userId')}
       ${respAssertion('login','Login successful')}
     </hashTree>`,
    timer(t[0],t[1]),
    // 2. SEARCH products (read-heavy)
    httpSampler('02 Search products (read)','GET','/api/products?search=${search_term}'),
    `<hashTree>${codeAssertion('search','200')}</hashTree>`,
    timer(t[0],t[1]),
    // 3. PRODUCT detail (read-heavy)
    httpSampler('03 Product detail (read)','GET','/api/products/${product_id}'),
    `<hashTree>${codeAssertion('detail','200')}</hashTree>`,
    timer(t[0],t[1]),
    // 4. ADD to cart (transactional)  -- needs auth header
    httpSampler('04 Add to cart (txn)','POST','/api/cart',
      '{"id":${product_id},"name":"${name}","price":${price},"quantity":1}'),
    `<hashTree>${headerManager(true)}${codeAssertion('cart','200')}</hashTree>`,
    timer(t[0],t[1]),
    // 5. APPLY coupon (transactional)
    httpSampler('05 Apply coupon (txn)','POST','/api/apply-coupon',
      '{"code":"${code}","total_amount":${price},"user_id":${userId}}'),
    `<hashTree>${headerManager(true)}${respAssertion('coupon','final_amount')}</hashTree>`,
    timer(t[0],t[1]),
    // 6. CHECKOUT (transactional)
    httpSampler('06 Checkout (txn)','POST','/api/checkout',
      '{"total_amount":${price},"shipping_address":"123 Le Loi, TP.HCM"}'),
    `<hashTree>${headerManager(true)}${codeAssertion('checkout','200')}</hashTree>`,
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${SID}_${scen}_${DATE}" enabled="true">
      ${strProp('TestPlan.comments', cfg.note)}
      ${boolProp('TestPlan.functional_mode','false')}
      ${boolProp('TestPlan.serialize_threadgroups','false')}
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments">
          <elementProp name="BASE_HOST" elementType="Argument">
            ${strProp('Argument.name','BASE_HOST')}${strProp('Argument.value','localhost')}${strProp('Argument.metadata','=')}
          </elementProp>
          <elementProp name="BASE_PORT" elementType="Argument">
            ${strProp('Argument.name','BASE_PORT')}${strProp('Argument.value','3000')}${strProp('Argument.metadata','=')}
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    <hashTree>
      ${csvConfig('users', CSV_USERS, 'email,password,name')}
      ${csvConfig('products', CSV_PROD, 'product_id,name,price,search_term')}
      ${csvConfig('coupons', CSV_COUPON, 'code,min_order_amount')}
      ${headerManager(false)}
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="E2E ${scen}" enabled="true">
        ${strProp('ThreadGroup.on_sample_error','continue')}
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop">
          ${boolProp('LoopController.continue_forever','false')}
          ${strProp('LoopController.loops', String(cfg.loops))}
        </elementProp>
        ${strProp('ThreadGroup.num_threads', '${__P(THREADS,'+cfg.threads+')}')}
        ${strProp('ThreadGroup.ramp_time', '${__P(RAMP,'+cfg.ramp+')}')}
        ${boolProp('ThreadGroup.scheduler','true')}
        ${strProp('ThreadGroup.duration', '${__P(DURATION,'+cfg.duration+')}')}
        ${strProp('ThreadGroup.delay','0')}
        ${boolProp('ThreadGroup.same_user_on_next_iteration','false')}
      </ThreadGroup>
      <hashTree>
        ${steps}
        ${listener(cfg, SID, scen)}
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>`;
}

for (const [scen, cfg] of Object.entries(scenarios)){
  const file = path.join(__dirname, `${SID}_${scen}_${DATE}.jmx`);
  fs.writeFileSync(file, buildPlan(scen, cfg), 'utf8');
  console.log('wrote', path.basename(file), `(${cfg.threads} VU, ramp ${cfg.ramp}s, ${cfg.listener})`);
}
