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
     * Fired whenever the container changes the recordId attribute (provided via the force:hasRecordId interface)
     **/
	onRecordIdChange : function(component, event, helper) {
	    if(component.get('v.recordId')!=null) {
	        component.find("recordLoader").reloadRecord();
	    } else {
	        helper.reset(component, null);
	    }
	},
	/**
     * Fired when Lightning Data Services loads (or reloads) the record in view
     **/
    onRecordUpdated : function(component, event, helper) {
        // The loaded record is passed at a later stage to the flow, for now we are interested in the API name to lookup config
        component.set('v.metadataRecordName', 'DynamicFlowComponent.' + component.get('v.record.apiName'));
        component.find("metadataRecordLoader").reloadRecord();
    },
    /**
	 * Fired when the Lighting Custom Metadata Services loads a custom metadata record
     **/
    onMetadataRecordUpdated : function(component, event, helper) {
        var changeType = event.getParam('changeType');
        var result = event.getParam("result");
        if(changeType == 'CHANGED') {
            component.set('v.metadataRecordError', null);
        } else if(changeType == 'ERROR') {
            component.set('v.metadataRecordError', result.fullName ? result.message : result);
            helper.reset(component, null);            
            component.set('v.setupNameRequired', component.get('v.record.apiName'));
        } else if(changeType == 'LOADED') {
            component.set('v.metadataRecordError', null);
            helper.reset(component, component.get('v.metadataRecord.flowtb__Flow__c'));    
            // Use of the IsAutoLaunched and AutoLaunchedOutputVariables fields relates to the workaround in runFlow        
            helper.runFlow(
                component,
                component.get('v.metadataRecord.flowtb__Flow__c'), 
                component.get('v.metadataRecord.flowtb__IsAutoLaunched__c'),
                component.get('v.metadataRecord.flowtb__AutoLaunchedOutputVariables__c'));
        }
        // Lets the reset method in the helper know its safe to reset the component if called
        component.set('v.loaded', true);    
    },
    /**
     * Fired when the Flow component completes a Flow (the user clicks Finish)
     **/
    onFlowStatusChange : function(component, event, helper) {
        if(event.getParam("status") === "FINISHED" || event.getParam("status") == 'FINISHED_SCREEN') {
            // Per the docs FINISHED_SCREEN relates to AutoLaunched flows, only issue is outputVariables is always null
            //  hence AutoLaunched flows are presently never routed through the Flow component, see notes in runFlow
            var outputVariables = event.getParam("outputVariables");
            if(outputVariables!=null) {
                helper.handleFlowOutput(component, event.getParam('flowTitle'), outputVariables);
            }
        } else if (event.getParam("status") === "Error") {
            helper.error("Flow Component failed to load the Flow");
        }
    }
})