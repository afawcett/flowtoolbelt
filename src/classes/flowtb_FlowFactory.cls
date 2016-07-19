/**
 * Auto Generated and Deployed by the Flow Toolbet package (flowtb)
 **/
global class flowtb_FlowFactory implements IFlowFactory {
    public Flow.Interview newInstance(String flowName, Map<String, Object> params) {
        if(flowName == 'TestA')
            return new Flow.Interview.TestA(params);
        return null;
    }
}