var async = require('async');
var TaskCargo = function(options) {
	this.size = options.size ? options.size : 10;
	this.queue = async.cargo(function(tasks, callback) {
		console.log(tasks);
		tasks.forEach(function(task) {
			task.run(callback);
		});
	}, this.size);
	this.status = {
		success : 0,
		error : 0,
		errorTask : []
	};
	this._init(options);
};

TaskCargo.prototype._init = function(options) {
	// 所有任务执行完
	var drain = options.drain;
	// 最后一个任务交给worker
	var empty = options.empty;
	// worker数量将用完
	var saturated = options.saturated;
	this.queue.drain = drain;
	this.queue.empty = empty;
	this.queue.saturated = saturated;
}
TaskCargo.prototype.pushAll = function(tasks, callback) {
	var that = this;
	tasks.forEach(function(task) {
		that.push(task, callback);
	});
};

TaskCargo.prototype.push = function(task, callback) {
	var that = this;
	if ((task.run && typeof (task.run) == "function") || typeof (task) == "object") {
		this.queue.push(task, function(error, data, context) {
			if (error) {
				that.status.error++;
				that.status.errorTask.push(task);
				callback(error);
			} else {
				that.status.success++;
				callback(null, data, context);
			}
		});
	} else {
		that.status.error++;
		that.status.errorTask.push(task);
		callback("queue task must have run function");
	}
};

module.exports = TaskCargo;