# Flow Toolbelt

WIP: A new package to help create Flows dynamically and do more things with them from more places!

Read this [blog](https://andyinthecloud.com/2016/07/19/introducing-the-flow-factory/) for further documentation and background.

Packages
========

You can install via a managed package for ease of use and easy upgrades or you can install the code to help contribute and develop the tool.

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

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>
