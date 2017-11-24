({
	onRecordIdChange : function(component, event, helper) {
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
            $A.createComponent("lightning:flow", { 'onstatuschange' : component.getReference('c.onFlowStatusChange') }, 
                function(newFlow, status, errorMessage) {
                    component.set("v.body", [ newFlow ]);
                    newFlow.startFlow(
                        component.get('v.metadataRecord.flowtb__Flow__c'),
                        [ { name: 'flowtb_record', type : 'SObject', value : component.get('v.simpleRecord') } ] );
                });                     
        }    
    },
    onFlowStatusChange : function(component, event, helper) {
        console.log('Flow status change ' + event.getParam("status"));
        if(event.getParam("status") === "FINISHED" || event.getParam("status") == 'FINISHED_SCREEN') {
            var eventToFire = null;
            var eventParams = {};
            var outputVariables = event.getParam("outputVariables");
            var outputVar;
            if(outputVariables!=null) {
                for(var i = 0; i < outputVariables.length; i++) {
                    outputVar = outputVariables[i];
                    if(outputVar.name === 'flowtb_event') {
                        eventToFire = $A.get(outputVar.value);
                    } else if (outputVar.name.startsWith('flowtb_param')) {
                        var paramName = outputVar.name.split('_')[2];
                        eventParams[paramName] = outputVar.value; 
                    }                
                }
                if(eventToFire!=null) {
                    eventToFire.setParams(eventParams);
                    eventToFire.fire();
                }
            }
        }
    }
})