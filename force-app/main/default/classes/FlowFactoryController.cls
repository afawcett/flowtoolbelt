/**
 * Copyright (c), Andrew Fawcett, inc
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
 * - Neither the name of the Andrew Fawcett, inc nor the names of its contributors 
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

public with sharing class FlowFactoryController {
	public String ZipData { get; set; }	
	
	public MetadataService.AsyncResult AsyncResult {get; private set;}

	public String FactoryName { get; set; }
	
	public String FactoryTestName { get; set; }
	
	public Boolean Deployed { get; set; }
	
	public ApexClass FactoryX { get; private set; }
	
	public ApexClass FactoryTest { get; private set; }
	
	public Integer deployCount;
	
	public Boolean MetadataConnectionError {get;set;}

	public Set<String> Flows {get;set;} 	
	
	public FlowFactoryController()
	{		
		// Generate names for test and Factorys to deploy / undeploy
		FactoryName = 'flowtb_FlowFactory';
		FactoryTestName = 'flowtb_FlowFactoryTest';

		// Initialise view state
        init();
        
		// Active subscriptions and the Flows they require
		if(!MetadataConnectionError) {
    		Flows = new Set<String>();
            MetadataService.MetadataPort service = createService();
            List<MetadataService.ListMetadataQuery> queries = new List<MetadataService.ListMetadataQuery>();
            MetadataService.ListMetadataQuery queryFlow = new MetadataService.ListMetadataQuery();
            queryFlow.type_x = 'Flow';
            queries.add(queryFlow);
            MetadataService.FileProperties[] fileProperties = service.listMetadata(queries, 36);
            if(fileProperties!=null) {
	            for(MetadataService.FileProperties fileProperty : fileProperties)
	                Flows.add(fileProperty.fullName.split('-')[0]);
            }
		}
	}
	
	public String getPackageXml()
	{
		if(Deployed)
			// package.xml for undeploy
			return 
			    '<?xml version="1.0" encoding="UTF-8"?>' + 
				'<Package xmlns="http://soap.sforce.com/2006/04/metadata">' + 
	    			'<version>32.0</version>' + 
				'</Package>';		
		else
			// package.xml for deploy
			return 
			    '<?xml version="1.0" encoding="UTF-8"?>' + 
				'<Package xmlns="http://soap.sforce.com/2006/04/metadata">' + 
	    			'<types>' + 
	        			'<members>'+FactoryName+'</members>' +
	        			'<name>ApexClass</name>' + 
	    			'</types>' + 
	    			'<types>' + 
	        			'<members>'+FactoryTestName+'</members>' +
	        			'<name>ApexClass</name>' + 
	    			'</types>' + 
	    			'<version>32.0</version>' + 
				'</Package>';		
	}
	
	public String getDestructiveChangesXml()
	{
		return 
		    '<?xml version="1.0" encoding="UTF-8"?>' + 
			'<Package xmlns="http://soap.sforce.com/2006/04/metadata">' + 
    			'<types>' + 
        			'<members>'+FactoryName+'</members>' +
        			'<name>ApexClass</name>' + 
    			'</types>' + 
    			'<types>' + 
        			'<members>'+FactoryTestName+'</members>' +
        			'<name>ApexClass</name>' + 
    			'</types>' + 
    			'<version>32.0</version>' + 
			'</Package>';				
	}
	
	public String getFactoryTestCodeMetadata()
	{
		return 
		    '<?xml version="1.0" encoding="UTF-8"?>' +
			'<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">' +
			    '<apiVersion>32.0</apiVersion>' + 
			    '<status>Active</status>' +
			'</ApexClass>';		
	}
		
	public String getFactoryTestCode()	
	{
		if(Deployed && FactoryTest!=null)
			// Display currently deployed code for confirmation
			return FactoryTest.Body; 
		else
		{
			// Generate factory code...
			List<String> codeLines = new List<String>();
			for(String flowName: Flows) {
				codeLines.add('        factory.newInstance(\'' + flowName + '\', new Map<String, Object>());');
			}			
			// Deploy generated code
			return
			 	'/**\n' +
				' * Auto Generated and Deployed by the Flow Toolbelt package (flowtb)\n' +
				' **/\n' +	
				'@IsTest\n' +	 
			    'private class ' + FactoryTestName + '\n' +  
				'{\n' + 
				'    private static testmethod void testFactory()\n' +
				'    {\n' + 
				'        ' + FactoryName + ' factory = new ' + FactoryName + '();\n' + 
				         String.join(codeLines, '\n') + '\n' + 				
				'    }\n' +
				'}';			
		}
	}
	
	public String getFactoryCodeMetadata()
	{
		return 
		    '<?xml version="1.0" encoding="UTF-8"?>' +
			'<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">' +
			    '<apiVersion>32.0</apiVersion>' + 
			    '<status>Active</status>' +
			'</ApexClass>';
	}
	
	public String getFactoryCode()
	{
		if(Deployed && FactoryX!=null)
		{
			// Display currently deployed code for confirmation
			return FactoryX.Body;
		} 
		else
		{
			// Namespace?
			Integer i = Database.countQuery('select count() from ApexClass where Name = \'FlowFactoryController\' and NamespacePrefix=\'flowtb\'');
			String namespace = i > 0 ? 'flowtb' : '';
			// Generate factory code...
			List<String> codeLines = new List<String>();
			for(String flowName: Flows) {
				codeLines.add('        if(flowName == \'' + flowName + '\')');
				codeLines.add('            return new Flow.Interview.' + flowName + '(params);');
			}
			// Deploy generated code		
			return 
				'/**\n' +
				' * Auto Generated and Deployed by the Flow Toolbet package (flowtb)\n' +
				' **/\n' + 
				'global class ' + FactoryName + ' implements ' + (namespace.length()>0 ? 'flowtb.' : '') + 'IFlowFactory {\n' +
				'    public Flow.Interview newInstance(String flowName, Map<String, Object> params) {\n' + 
				         String.join(codeLines, '\n') + '\n' + 
				'        return null;\n' + 
				'    }\n'+
				'}\n';
		}		
	}

	public PageReference deployZip()
	{
		ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, Deployed ? 'Removing...' : 'Deploying...'));

		// Deploy zip file posted back from the page action function				
		MetadataService.MetadataPort service = createService();
		MetadataService.DeployOptions deployOptions = new MetadataService.DeployOptions();
		deployOptions.testLevel = 'RunSpecifiedTests';
		deployOptions.runTests = new List<String> { FactoryTestName };
        deployOptions.allowMissingFiles = false;
        deployOptions.autoUpdatePackage = false;
        deployOptions.checkOnly = false;
        deployOptions.ignoreWarnings = false;
        deployOptions.performRetrieve = false;
        deployOptions.purgeOnDelete = false;
        deployOptions.rollbackOnError = true;
        deployOptions.singlePackage = true;		
		AsyncResult = service.deploy(ZipData, DeployOptions);		
		return null;
	}	
	
	public PageReference checkAsyncRequest()
	{	
		// Check the status of the retrieve request
		MetadataService.MetadataPort service = createService();
		MetadataService.DeployResult deployResult = service.checkDeployStatus(AsyncResult.Id, true);
		if(deployResult.done)
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, Deployed ? 'Remove complete.' : 'Deployment complete.'));

			// Deployment errors?
			if(deployResult.details!=null && deployResult.details.componentFailures!=null)
				for(MetadataService.DeployMessage deployMessage : deployResult.details.componentFailures)
					if(deployMessage.problem!=null)
						ApexPages.addMessage(
							new ApexPages.Message(ApexPages.Severity.Error, 
								deployMessage.fileName + 
									' (Line: ' + deployMessage.lineNumber + ': Column:' + deployMessage.columnNumber + ') : ' + 
										deployMessage.problem));
			// Test errors?
			MetadataService.RunTestsResult runTestResult = deployResult.details.runTestResult;
			if(runTestResult.numFailures > 0)
				for(MetadataService.RunTestFailure testFailure : runTestResult.failures)
					ApexPages.addMessage(
						new ApexPages.Message(ApexPages.Severity.Error, 
							testFailure.name + '.' + testFailure.methodName + ' ' + testFailure.message + ' ' + testFailure.stackTrace));
			// Code coverage warnings?
			if(runTestResult.codeCoverageWarnings!=null)
				for(MetadataService.CodeCoverageWarning codeCoverageWarning : runTestResult.codeCoverageWarnings)
					ApexPages.addMessage(
						new ApexPages.Message(ApexPages.Severity.Warning, 
							(codeCoverageWarning.namespace!=null ? codeCoverageWarning.namespace+'.' : '') +
							codeCoverageWarning.name + ':' +
							codeCoverageWarning.message));
			
			AsyncResult = null;
			
			// Initialise view state to try again
			init();
		}
		else
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, (Deployed ? 'Removing...' : 'Deploying...') + '.'.repeat(deployCount++)));
		}	
		return null;
	}
	
	private void init()
	{
		// Metadata API connection?
		MetadataConnectionError = !checkMetadataAPIConnection();
		if(MetadataConnectionError)
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, 'Salesforce Metadata API connection failure, click the link below to configure.'));
			return;			
		}
		
		// Already deployed?
		List<String> classNames = new List<String> { FactoryTestName, FactoryName };
		Map<String, ApexClass> apexClasses = new Map<String, ApexClass>();
		for(ApexClass apexClass : [select Name,Body from ApexClass where Name in :classNames]) {
		    apexClasses.put(apexClass.Name, apexClass);
		}
		Deployed = apexClasses.containsKey(FactoryTestName) && apexClasses.containsKey(FactoryName);
		FactoryX = Deployed ? apexClasses.get(FactoryName) : null;
		FactoryTest = Deployed ? apexClasses.get(FactoryTestName) : null;
		deployCount = 0;
		
		// Message to confirm current status
		if(Deployed)
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, 'Apex Flow Factory <b>' + FactoryName + '</b> is installed.'));  		
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, 'Apex Flow Factory Test <b>' + FactoryTestName + '</b> is installed.')); 
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, 'Click <b>Remove</b> to uninstall the Apex Flow Factory and Flow Factory Test classes.'));  					
		}
		else
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, 'Click <b>Deploy</b> to install the Apex Flow Factory and Apex Flow Factory Test classes.')); 
		}
	}
	
	private static MetadataService.MetadataPort createService()
	{ 
		MetadataService.MetadataPort service = new MetadataService.MetadataPort();
		service.SessionHeader = new MetadataService.SessionHeader_element();
		service.SessionHeader.sessionId = UserInfo.getSessionId();
		return service;		
	}	

	private static Boolean checkMetadataAPIConnection()
	{
		try {
			MetadataService.MetadataPort service = new MetadataService.MetadataPort();
			service.SessionHeader = new MetadataService.SessionHeader_element();
			service.SessionHeader.sessionId = UserInfo.getSessionId();
			List<MetadataService.ListMetadataQuery> queries = new List<MetadataService.ListMetadataQuery>();		
			MetadataService.ListMetadataQuery remoteSites = new MetadataService.ListMetadataQuery();
			remoteSites.type_x = 'RemoteSiteSetting';
			queries.add(remoteSites);					
			service.listMetadata(queries, 28);			
		} catch (Exception e) {
			return false;
		}
		return true;
	}
}