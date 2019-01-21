/**
 * Copyright (c) 2017, Andrew Fawcett
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

({
    /**
     * Runs the given Flow
     **/
    runFlow : function(component, flow) {
        var helper = this;
        // Dynamically creating the lightning:flow component here since it appears not to all Flows to be restarted
        $A.createComponent("lightning:flow", { 'onstatuschange' : component.getReference('c.onFlowStatusChange') }, 
            function(newFlow, status, errorMessage) {
                if (status === "SUCCESS") {
                    component.set("v.body", [ newFlow ]);
                    newFlow.startFlow(flow, [ 
                        { name: 'flowtb_record', type : 'SObject', value : component.get('v.simpleRecord') } ] );
                } else {
                    helper.error('Failed to create lightning:flow component ' + errorMessage);
                }
            });                     
    },
    /**
     * Parses a collection of output variables from a flow and invokes various actions, runs another flow, lex event, utlity bar
     **/
	handleFlowOutput : function(component, flow, outputVariables) {
	    var utilityAPI = component.find("utilitybar");
	    var flowToRun = null;
        var eventToFire = null;
        var eventParams = {};
        var outputVar;	
        var helper = this;
        for(var i = 0; i < outputVariables.length; i++) {
            outputVar = outputVariables[i];
            if(outputVar.value == null) {
            	continue;
            }
            if(outputVar.name === 'flowtb_runFlow') {
                flowToRun = outputVar.value;
            } else if(outputVar.name === 'flowtb_event') {
                eventToFire = $A.get(outputVar.value);
                if(eventToFire == null) {
                    helper.error('flowtb_event ' + outputVar.value + ' does not exist');
                }
            } else if (outputVar.name.startsWith('flowtb_param')) {
                var paramName = outputVar.name.split('_')[2];
                eventParams[paramName] = outputVar.value; 
            } else if (outputVar.name === 'flowtb_minimize_utility') {
                utilityAPI.minimizeUtility({});
            } else if (outputVar.name === 'flowtb_open_utility') {
                utilityAPI.getUtilityInfo().then(function(response) {
                    // Record the current visible state (the users present preference) of the utility bar 
                    //   such that it can be restored later when the user navigates away (see reset method)
                    if(component.get('v.minimizeUtility') == null) {
                        component.set('v.minimizeUtility', response.utilityVisible ? false : true);
                    }
                    // Asking the utility bar to open when its open causes a jumping effect, lets avoid that
                    if (!response.utilityVisible) {
                        utilityAPI.openUtility();
                    }
                }).catch(function(error) {
                	console.log(error);
                });
            } else if (outputVar.name === 'flowtb_utility_highlighted') {
                utilityAPI.setUtilityHighlighted({ highlighted : outputVar.value });
            } else {
                helper.error('Unexpected variable ' + outputVar.name + ' returned from flow ' + flow);            
            }              
        }
        if(eventToFire!=null) {
            // This approach in theory allows a wide selection of events to be fired, such as the navigation ones
            eventToFire.setParams(eventParams);
            eventToFire.fire();
        }
        if(flowToRun!=null) {
            // This allows an auto launch flow to run a UI flow for the end user if it desires
            this.runFlow(component, flowToRun);
        }		
	},
	/**
     * Reset the component, occurs when the user navigates to an object or page that is not configured for this component
     **/
	reset : function(component, flow) {
	    // Disable reset logic until the component has been initialized at least once
        if(component.get('v.loaded')) { 
            component.set("v.body", [ ]);
            // This method appears to be sensitive to the component initialization status, hence the v.loaded usage
            component.find("utilitybar").setUtilityHighlighted({ highlighted : false });
            // If the Utility Bar was displayed by a Flow and the user previously had it minimized restore that state
            if(flow == null || component.get('v.currentFlow') != flow) {
                if(component.get('v.minimizeUtility') == true) {            
                    component.find("utilitybar").minimizeUtility({});
                }
                component.set('v.minimizeUtility', null);
            }
            // Above logic applies only when the flow in context changes
            component.set('v.currentFlow', flow);
            // Clear setup notification
            component.set('v.setupNameRequired', null);
        }	
	},
	error : function(error) {
	    var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({ "title" : "Dynamic Flow Component", "type" : "error", "message": error });
        toastEvent.fire();	    
	}
})