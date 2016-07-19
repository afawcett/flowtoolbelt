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

global class RemoteSiteHelperController {
	
	public String Host {get;set;}
	global String rssNameString {get;set;}
	public String MetadataResponse {get;set;}
	public Boolean MetadataConnectionWarning {get;set;}
	public String MetadataApiException {get;set;}
	global static Exception LastMetadataAPIConnectionException {get; private set;}
	
	global RemoteSiteHelperController() {
		Host = ApexPages.currentPage().getHeaders().get('Host');
				
		// Attempt to connect to the Metadata API
		MetadataConnectionWarning = false;
		if(!RemoteSiteHelperController.checkMetadataAPIConnection())
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, 'Unable to connect to the Salesforce Metadata API.'));
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, 'A Remote Site Setting must be created in your org before you can use this tool.'));
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, 'Press the Create Remote Site Setting button to perform this step or refer to the post install step below to perform this manually.'));
			MetadataConnectionWarning = true;
			MetadataApiException = '';
			if(RemoteSiteHelperController.LastMetadataAPIConnectionException!=null)
				MetadataApiException = RemoteSiteHelperController.LastMetadataAPIConnectionException.getMessage();
		}
		
	}
	
	public PageReference displayMetadataResponse()
	{
		// Display the response from the client side Metadata API callout
		if(metadataResponse.length()==0)
		{
			String infoString = String.format('Remote Site Setting {0} has been created.',new String[]{rssNameString});
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Info, infoString));
			MetadataConnectionWarning = false;
		}
		else
		{
			ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.Error, metadataResponse));
			MetadataConnectionWarning = true;
		}
		return null;
	}

	global static Boolean checkMetadataAPIConnection()
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
			LastMetadataAPIConnectionException = e;
			return false;
		}
		LastMetadataAPIConnectionException = null;
		return true;
	}
}