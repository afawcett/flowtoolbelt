({
	onRecordIdChange : function(component, event, helper) {
	    if(component.get('v.recordId')!=null) {
	        component.find("recordLoader").reloadRecord();
	    } else {
	        helper.reset(component, null);
	    }
	},
    onRecordUpdated : function(component, event, helper) {
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
            helper.reset(component, component.get('v.metadataRecord.flowtb__Flow__c'));            
            helper.runFlow(
                component,
                component.get('v.metadataRecord.flowtb__Flow__c'), 
                component.get('v.metadataRecord.flowtb__IsAutolaunched__c'),
                component.get('v.metadataRecord.flowtb__AutoLaunchedOutputVariables__c'));
        }
        component.set('v.loaded', true);    
    },
    onFlowStatusChange : function(component, event, helper) {
        if(event.getParam("status") === "FINISHED" || event.getParam("status") == 'FINISHED_SCREEN') {
            var outputVariables = event.getParam("outputVariables");
            if(outputVariables!=null) {
                helper.handleFlowOutput(component, event.getParam('flowTitle'), outputVariables);
            }
        } else if (event.getParam("status") === "Error") {
            helper.error("Flow Component failed to load the Flow");
        }
    }
})