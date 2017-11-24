({
	onRecordIdChange : function(component, event, helper) {
	    component.set("v.body", [ ]);
	    component.find("recordLoader").reloadRecord();
	},
    onRecordUpdated : function(component, event, helper) {
        console.log('Record ' + component.get('v.simpleRecord.Name') + ' (' + component.get('v.record.apiName') + ')' );        
        component.set('v.metadataRecordName', 'DynamicFlowComponent.' + component.get('v.record.apiName'));
        component.find("metadataRecordLoader").reloadRecord();
    },	
    onMetadataRecordUpdated : function(component, event, helper) {
        var changeType = event.getParam('changeType');
        var result = event.getParam("result");
        if(changeType == 'CHANGED') {
            component.set('v.metadataRecordError', null);
        } else if(changeType == 'ERROR') {
            component.set('v.metadataRecordError', result.fullName ? result.message : result);
        } else if(changeType == 'LOADED') {
            component.set('v.metadataRecordError', null);
            console.log('Metadata Record Flow ' + component.get('v.metadataRecord.flowtb__Flow__c') );
            if(component.get('v.metadataRecord.flowtb__IsAutolaunched__c')) {
                var action = component.get("c.runFlow");
                action.setParams({ 
                    flow : component.get('v.metadataRecord.flowtb__Flow__c'),
                    flowOutputParamNames : component.get('v.metadataRecord.flowtb__AutoLaunchedOutputVariables__c'),  
                    record : component.get('v.simpleRecord') });  
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var outputVariables = response.getReturnValue();
                        helper.handleFlowOutput(component, outputVariables);
                    }});
                $A.enqueueAction(action);                
            } else {
                $A.createComponent("lightning:flow", { 'onstatuschange' : component.getReference('c.onFlowStatusChange') }, 
                    function(newFlow, status, errorMessage) {
                        component.set("v.body", [ newFlow ]);
                        newFlow.startFlow(
                            component.get('v.metadataRecord.flowtb__Flow__c'),
                            [ { name: 'flowtb_record', type : 'SObject', value : component.get('v.simpleRecord') } ] );
                    });                     
            }
        }    
    },
    onFlowStatusChange : function(component, event, helper) {
        console.log('Flow status change ' + event.getParam("status"));
        if(event.getParam("status") === "FINISHED" || event.getParam("status") == 'FINISHED_SCREEN') {
            var outputVariables = event.getParam("outputVariables");
            if(outputVariables!=null) {
                helper.handleFlowOutput(component, outputVariables);
            }
        }
    }
})