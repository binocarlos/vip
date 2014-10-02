vip
---

[status: not maintained] - I've started using consul which has a [leader election](http://www.consul.io/docs/guides/leader-election.html) module

vip (very important process) is a module that uses a distributed lock module [locked](https://github.com/binocarlos/locked) to ensure that only one copy of a function is running across a cluster

This is useful to avoid a split brain when running some kind of cluster wide co-ordination process

It uses [etcd](https://github.com/coreos/etcd) which uses the [raft protocol](http://raftconsensus.github.io/)

## install

```
$ npm install vip
```

## usage

Create a new vip function that will run only once on the elected node:

```js
var vip = require('vip')

// pass the etcd connection string 
var vipcontroller = vip('127.0.0.1:4001,127.0.0.1:4002')

// this can also be an etcdjs object
var vipcontroller = vip(etcdjs('127.0.0.1:4001,127.0.0.1:4002'))

// create a candidate passing the key path and node name
var httpRouter = vipcontroller({
	path:'/http_router',
	id:'node1',
	value:'apples',
	ttl:10
}, function(){

	// here we start the router
	// this code will only ever have one copy running across the cluster

})

httpRouter.on('select', function(id, value){
	// this is run only on the node that was elected
})

httpRouter.on('change', function(id, value){
	// this is run across all nodes
})

httpRouter.start()
```

## api

#### `var vipcontroller = vip(etcdhosts)`

Create a controller that is connected to some etcd peers

#### `var service = vipcontroller(opts, fn)`

Create a new candidate function - opts is an object with the following keys:

 * id - the id of this node
 * path - the key path used to co-ordinate the lock
 * value - the value associated with the node (can be any string)
 * ttl - the time to live used by the locking module

fn is executed once and only when the node is elected as the current leader for the service across the cluster

## events

#### `service.on('select', function(value){})`

This event is triggered when the node has been elected and it's value distributed to the cluster.

You can run logic in this function that should only be running on one server at a time.

#### `service.on('change', function(value, nodeid){})`

This event is triggered when the lock value has changed regardless of which node was elected.

The nodeid is of the elected machine is passed as the second argument.

## license

MIT