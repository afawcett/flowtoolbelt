# Flow Toolbelt

Read these blogs for more information:-

- Read this [blog](https://andyinthecloud.com/2017/12/10/introducing-the-dynamic-flow-component/) for further documentation on the Dynamic Flow Component (DFC)
- Read this [blog](https://andyinthecloud.com/2016/07/19/introducing-the-flow-factory/) for further documentation and background on the Flow Factory (dynamic creation of Flows in Apex).

Packages
========

You can install via a managed package for ease of use and easy upgrades or you can install the code to help contribute and develop the tool.

v2.1
----

[Production](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t58000000KkOY) and [Sandbox](https://test.salesforce.com/packaging/installPackage.apexp?p0=04t58000000KkOY)

- Added additional info messaging when the component is not active
- Resolved an error message popup when the component was used on a page and the flow invoked a utlity bar api

v2.0
----

[Producton](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t58000000KkOT) and [Sandbox](https://test.salesforce.com/packaging/installPackage.apexp?p0=04t58000000KkOT)

- This release adds an exciting new **Lightning Component**. The **Dynamic Flow component** can be used to display Flows dynamically while tracking user navigation and record edits. Additionally it allows Flow logic to interact with **Lightning Experience** features such as **Utility Bar** and associated API's to drive **navigation** to other records, pages, display **notifications**, **popups** and more all **100% declarative of course!**. For more information see [here](https://github.com/afawcett/flowtoolbelt/wiki).

v1.0
----

[Producton](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t58000000Vpih) and [Sandbox](https://test.salesforce.com/packaging/installPackage.apexp?p0=04t58000000Vpih)
- Initial release, only with an API flowtb.FlowFactory.newInstance

~~~
Flow.Interview flow = flowtb.FlowFactory.newInstance('TestA', new Map<String, Object>());
flow.start();
System.debug(flow.getVariableValue('Var'));
~~~

Developers
==========

Want to contribute to the code or just take a better look? This option is for you... 

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>
