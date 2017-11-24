({
    runFlow : function(component, flow, isAutoLaunched, flowOutputParamNames) {
        var helper = this;
        if(isAutoLaunched) {
            var action = component.get("c.runFlow");
            action.setParams({ 
                flow : flow,
                flowOutputParamNames : flowOutputParamNames == null ? '' : flowOutputParamNames,  
                record : component.get('v.simpleRecord') });  
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var outputVariables = response.getReturnValue();
                    helper.handleFlowOutput(component, flow, outputVariables);
                } else {
                    helper.error(response.getError()[0].message);
                }});
            $A.enqueueAction(action);                
        } else {
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
        }    
    },
	handleFlowOutput : function(component, flow, outputVariables) {
	    var utilityAPI = component.find("utilitybar");
	    var flowToRun = null;
        var eventToFire = null;
        var eventParams = {};
        var outputVar;	
        for(var i = 0; i < outputVariables.length; i++) {
            outputVar = outputVariables[i];
            if(outputVar.name === 'flowtb_runFlow') {
                flowToRun = outputVar.value;
            } else if(outputVar.name === 'flowtb_event') {
                eventToFire = $A.get(outputVar.value);
            } else if (outputVar.name.startsWith('flowtb_param')) {
                var paramName = outputVar.name.split('_')[2];
                eventParams[paramName] = outputVar.value; 
            } else if (outputVar.name === 'flowtb_minimize_utility') {
                utilityAPI.minimizeUtility({});
            } else if (outputVar.name === 'flowtb_open_utility') {
                utilityAPI.getUtilityInfo().then(function(response) {
                    if(component.get('v.minimizeUtility') == null) {
                        component.set('v.minimizeUtility', response.utilityVisible ? false : true);
                    }
                    if (!response.utilityVisible) {
                        utilityAPI.openUtility();
                    }
                }).catch(function(error) {
                    this.error(error);
                });
            } else if (outputVar.name === 'flowtb_utility_highlighted') {
                utilityAPI.setUtilityHighlighted({ highlighted : outputVar.value });
            } else {
                this.error('Unexpected variable ' + outputVar.name + ' returned from flow ' + flow);            
            }              
        }
        if(eventToFire!=null) {
            eventToFire.setParams(eventParams);
            eventToFire.fire();
        }
        if(flowToRun!=null) {
            this.runFlow(component, flowToRun);
        }		
	},
	reset : function(component, flow) {
        if(component.get('v.loaded')) {
            component.set("v.body", [ ]);
            component.find("utilitybar").setUtilityHighlighted({ highlighted : false });
            if(flow == null || component.get('v.currentFlow') != flow) {
                if(component.get('v.minimizeUtility') == true) {            
                    component.find("utilitybar").minimizeUtility({});
                }
                component.set('v.minimizeUtility', null);
            }
            component.set('v.currentFlow', flow);
        }	
	},
	error : function(error) {
	    var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({ "title" : "Error", "type" : "error", "message": error });
        toastEvent.fire();	    
	}
})