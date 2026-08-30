# Reference — `.jmx` element structure

JMeter test plans are XML where every element is followed by its own `<hashTree>` holding its
children. Generate them with a script (see `test-plans/generate_plans.js`) so all scenarios stay
consistent — hand-editing XML is error-prone.

## Skeleton
```
<jmeterTestPlan version="1.2" ...>
 <hashTree>
  <TestPlan .../>                         user-defined vars: BASE_HOST, BASE_PORT
  <hashTree>
    <CSVDataSet .../><hashTree/>          one per CSV (users, products, coupons)
    <HeaderManager .../><hashTree/>       Content-Type: application/json
    <ThreadGroup .../>                    threads/ramp/duration via ${__P(NAME,default)}
    <hashTree>
      <HTTPSamplerProxy testname="01 Login"/>
      <hashTree>
        <JSONPostProcessor/><hashTree/>   $.token -> authToken ; $.user.id -> userId
        <ResponseAssertion/><hashTree/>
      </hashTree>
      <UniformRandomTimer/><hashTree/>     think-time between steps
      <HTTPSamplerProxy testname="02 Search"/><hashTree>...assertions...</hashTree>
      ... detail, cart(+auth header), coupon, checkout ...
      <ResultCollector guiclass="SummaryReport|StatVisualizer|ViewResultsFullVisualizer"/><hashTree/>
    </hashTree>
  </hashTree>
 </hashTree>
</jmeterTestPlan>
```

## Gotchas learned
- **Piping JMeter stdout through `head`/`grep -m`** sends SIGPIPE and kills the run early — capture
  full output, filter after.
- POST bodies need `HTTPSampler.postBodyRaw=true` and the JSON in a single unnamed `HTTPArgument`.
- The auth header (`Authorization: Bearer ${authToken}`) goes in a HeaderManager scoped to the
  transactional samplers (cart/coupon/checkout), after the login extractor has run.
- Distinct listeners across the 3 plans satisfy the "three report views" rule; the `-e -o` flags
  generate the HTML dashboard regardless of which GUI listener is embedded.
```
