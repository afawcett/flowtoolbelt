({
	handleFlowOutput : function(component, outputVariables) {
        var eventToFire = null;
        var eventParams = {};
        var outputVar;	
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
})