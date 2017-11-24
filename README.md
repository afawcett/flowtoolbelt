# Flow Toolbelt

Read this [blog](https://andyinthecloud.com/2016/07/19/introducing-the-flow-factory/) for further documentation and background.

Packages
========

You can install via a managed package for ease of use and easy upgrades or you can install the code to help contribute and develop the tool.

v2.0
----

Currently under development. This release adds an exciting new Lightning Component. The **Dynamic Flow component** can be used to display Flows dynamically while tracking user navigation and record edits. Additionally it allows Flow logic to interact with **Lighnting Experience** features such as **Utlity Bar** and associated API's to drive **navigation** to other records, pages, display **notifications**, **popups** and more all **100% declarative of course!**

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
