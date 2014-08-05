var vip = require('./')
var async = require('async')
var tape     = require('tape')
var etcdjs = require('etcdjs')
var etcd = etcdjs('127.0.0.1:4001')
var testPath = '/viptest'

function resetEtcd(){
  tape('clear out test key', function(t){
    etcd.del(testPath, {
      recursive:true
    }, function(err){
      t.end()
    })
  })
}

resetEtcd()

tape('competing functions', function(t){
  var vipcontroller = vip('127.0.0.1:4001')

  var hitfns = {}
  function lock1fn(value, id){
    t.equal(value, 'apples')
    t.equal(id, 'node1')
    hitfns.node1 = true
  }

  function lock2fn(value, id){
    t.equal(value, 'pears')
    t.equal(id, 'node2')
    hitfns.node2 = true
  }

  function lock3fn(value, id){
    t.equal(value, 'oranges')
    t.equal(id, 'node3')
    hitfns.node3 = true
  }

  var lock1 = vipcontroller({
    id:'node1',
    path:testPath,
    value:'apples',
    ttl:2
  }, lock1fn)
  var lock2 = vipcontroller({
    id:'node2',
    path:testPath,
    value:'pears',
    ttl:2
  }, lock2fn)
  var lock3 = vipcontroller({
    id:'node3',
    path:testPath,
    value:'oranges',
    ttl:2
  }, lock3fn)

  lock1.on('select', function(){
    console.log('lock1 selected')
  })

  lock2.on('select', function(){
    console.log('lock2 selected')
  })

  lock3.on('select', function(){
    console.log('lock3 selected')
  })

  lock1.start()
  lock2.start()
  lock3.start()

  setTimeout(function(){
    console.log('stopping lock1')
    lock1.stop()

    setTimeout(function(){

      t.equal(Object.keys(hitfns).length, 2, 'only 2 functions run')
      lock1.stop()
      lock2.stop()
      lock3.stop()
      t.end()
    }, 3000)
  }, 3000)
})

resetEtcd()