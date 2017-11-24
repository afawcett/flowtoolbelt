/**
 * Copyright (c) 2016, Andrew Fawcett
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 *   are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *      this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation 
 *      and/or other materials provided with the distribution.
 * - Neither the name of the Andrew Fawcett, nor the names of its contributors 
 *      may be used to endorse or promote products derived from this software without 
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 *  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 *  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

public with sharing class FlowController {

    @AuraEnabled
    public static List<FlowOutputVariable> runFlow(String flow, String flowOutputParamNames, SObject record) {
        try {
            
            // Run the Auto Launched flow
	        Flow.Interview flowInterview = 
	           FlowFactory.newInstance(flow, new Map<String, Object> { 'flowtb_record' => record });
	        if(flowInterview==null) {
	            throw new AuraHandledException('Flow ' + flow + ' not found.');
	        }
	        flowInterview.start();
	        
	        // Apex API does not allow enumeration of output variables, so the following uses a known list plus custom one
	        List<FlowOutputVariable> outputVariables = new List<FlowOutputVariable>();
	        Set<String> outputVarNames = new Set<String>(flowOutputParamNames.split('[\r\n]+'));
	        outputVarNames.add('flowtb_event');        
	        outputVarNames.add('flowtb_param_title');        
	        outputVarNames.add('flowtb_param_message');                
	        outputVarNames.add('flowtb_runFlow');        
	        outputVarNames.add('flowtb_minimize_utility');
	        outputVarNames.add('flowtb_open_utility');
	        outputVarNames.add('flowtb_utility_highlighted');        
	        for(String paramName : outputVarNames) {
		        FlowOutputVariable outputParam = new FlowOutputVariable();
		        outputParam.name = paramName;
		        outputParam.value = flowInterview.getVariableValue(paramName);
		        if(outputParam.value!=null) {
	                outputVariables.add(outputParam);            	            
		        }
	        }
            return outputVariables;
        }
        catch (AuraHandledException e) {
            throw e;
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());            
        }
    }   
    
    public class FlowOutputVariable {
        @AuraEnabled
        public String name;
        @AuraEnabled
        public Object value;        
    } 
}