var locked = require('locked')

module.exports = function(etcdhost){
	var locker = locked(etcdhost)
	return function(opts, fn){
		var candidate = locker(opts)
		var hasRun = false
		candidate.on('select', function(value, id){
			if(hasRun) return
			hasRun = true
			fn(value, id)
		})
		return candidate
	}
}