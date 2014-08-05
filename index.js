var locked = require('locked')
var littleid = require('littleid')

module.exports = function(etcdhost){
	var locker = locked(etcdhost)
	return function(opts, fn){
		var candidate = locker(opts)
		var hasRun = false
		candidate.on('select', function(){
			if(hasRun) return
			hasRun = true
			fn()
		})
		return candidate
	}
}