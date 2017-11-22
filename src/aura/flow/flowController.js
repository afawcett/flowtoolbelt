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
            $A.createComponent("lightning:flow", {}, 
                function(newFlow, status, errorMessage) {
                    component.set("v.body", [ newFlow ]);
                    newFlow.startFlow(component.get('v.metadataRecord.flowtb__Flow__c'));
                });                     
        }    
    }
})