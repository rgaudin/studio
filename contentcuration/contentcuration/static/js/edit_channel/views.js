var Backbone = require("backbone");
var _ = require("underscore");
var Models = require("./models");
//var UndoManager = require("backbone-undo");

var BaseView = Backbone.View.extend({
	list_index : 0,
	undo_manager: null,
	queue_view: null,
	delete_view: function(){
		this.remove();
	},
	set_editing: function(edit_mode_on){
		$(".disable-on-edit").prop("disabled", edit_mode_on);
		$(".disable-on-edit").css("cursor", (edit_mode_on) ? "not-allowed" : "pointer");
		$(".invisible-on-edit").css('visibility', (edit_mode_on)?'hidden' : 'visible');
	},
	edit_selected:function(){
		var UploaderViews = require("edit_channel/uploader/views");
		var list = this.$el.find('input:checked').parent("li");
		var edit_collection = new Models.ContentNodeCollection();
		/* Create list of nodes to edit */
		for(var i = 0; i < list.length; i++){
			var model = $(list[i]).data("data").model;
			model.view = $(list[i]).data("data");
			edit_collection.add(model);
		}
		$("#main-content-area").append("<div id='dialog'></div>");
		var content = null;
		if(edit_collection.length ==1){
			content = edit_collection.models[0];
		}

		var metadata_view = new UploaderViews.EditMetadataView({
			collection: edit_collection,
			parent_view: this,
			el: $("#dialog"),
			allow_add : false,
			main_collection: this.collection,
			modal:true,
			model: content
		});
	},
	add_to_view:function(){
		var UploaderViews = require("edit_channel/uploader/views");
		$("#main-content-area").append("<div id='dialog'></div>");
		var new_collection = new Models.ContentNodeCollection();
		var add_view = new UploaderViews.AddContentView({
			el : $("#dialog"),
			collection: new_collection,
			main_collection: this.collection,
			parent_view: this,
			model: this.model,
			modal:true
		});
	},
	display_load:function(message, callback){
    	var self = this;
		var load = '<div id="loading_modal" class="text-center fade">' +
            '<div id="kolibri_load_gif"></div>' +
            '<h4 id="kolibri_load_text" class="text-center">' + message + '</h4>' +
            '</div>';
        $(load).appendTo('body');
        if(callback){
    		setTimeout(function(){
    			try{
    				var promise = new Promise(function(resolve, reject){
						callback(resolve, reject);
    				});
    				promise.then(function(){
    					$("#loading_modal").remove();
    				}).catch(function(error){
    					$("#kolibri_load_text").text("Error with asychronous call. Please refresh the page");
    					console.log("Error with asychronous call", error);
    				});
    			}catch(err){
    				$("#kolibri_load_text").text(err + ". Please refresh the page");
    			}
			 }, 100);
    	}else{
    		$("#loading_modal").remove();
    	}
    },
	add_to_trash:function(collection, resolve, reject){
		//OVERWRITE IN SUBCLASSES
	},
	add_to_clipboard:function(collection, resolve, reject){
		//OVERWRITE IN SUBCLASSES
	},
	undo: function() {
        this.undo_manager.undo();
    },
    redo: function() {
        this.undo_manager.redo();
    },
    save:function(){
    	var self = this;
    	var promise = new Promise(function(resolve, reject){
			self.collection.save(resolve, reject);
		});
		promise.then(function(){

		}).catch(function(error){
			alert(error);
			console.log("Error with save", error);
    		console.trace();
		});
	},
	update_word_count:function(input, counter, limit){
		var char_length = limit - input.val().length;
		if(input.val().trim() == ""){
			char_length = limit;
		}
	    counter.html(char_length + ((char_length  == 1) ? " char left" : " chars left"));
	    counter.css("color", (char_length == 0)? "red" : "gray");
	},
	reload_listed:function(collection){
		var list_to_reload = [];
        collection.forEach(function(entry){
        	$.merge(list_to_reload, entry.get("ancestors"));
		});
		$.unique(list_to_reload).forEach(function(id){
			if($("#" + id) && $("#" + id).data("data")){
        		$("#" + id).data("data").reload();
        	}
		});
	},
	publish:function(){
		var self = this;
		var Exporter = require("edit_channel/export/views");
		var exporter = new Exporter.ExportModalView({
			model: window.current_channel.get_root("main_tree"),
			callback: function(){
				var list = $(".to_publish");
				list.each(function(index, entry){
					$(entry).data("data").reload();
				});
			}
		});
	}
});

BaseListView = BaseView.extend({
	views: [],			//List of item views to help with garbage collection
	collection : null,		//Collection to be used for data
	allow_edit: false,
	item_view: null, // Use to determine how to save, delete, update files

	set_editing: function(edit_mode_on){
		this.allow_edit = !edit_mode_on;
		$(".disable-on-edit").prop("disabled", edit_mode_on);
		$(".disable-on-edit").css("cursor", (edit_mode_on) ? "not-allowed" : "pointer");
		$(".invisible-on-edit").css('visibility', (edit_mode_on)?'hidden' : 'visible');
	},

	reset: function(){
		this.views.forEach(function(entry){
			entry.model.unset();
		});
	},
	set_sort_orders: function(collection){
		var index = 1;
		views.forEach(function(entry){
			entry.set({'sort_order' : ++index}, {validate: false});
		});
	},
	copy_selected:function(resolve, reject){
		var list = this.$el.find('input:checked').parent("li");
		var clipboard_list = [];
		var clipboard_root = window.current_user.get_clipboard();
		var copyCollection = new Models.ContentNodeCollection();
		for(var i = 0; i < list.length; i++){
			copyCollection.add($(list[i]).data("data").model);//.duplicate(clipboard_root, null);
		}
		var self = this;

        var promise = new Promise(function(resolve1, reject1){
            copyCollection.duplicate(clipboard_root, resolve1, reject1);
        });
        promise.then(function(collection){
            self.add_to_clipboard(collection, resolve, reject);
        }).catch(function(error){
            reject(error);
        });
	},
	delete_selected:function(resolve, reject){
		var list = this.$el.find('input:checked').parent("li");
		var deleteCollection = new Models.ContentNodeCollection();
		for(var i = 0; i < list.length; i++){
			var view = $("#" + list[i].id).data("data");
			deleteCollection.add(view.model);
			view.delete_view();
		}
		this.add_to_trash(deleteCollection, resolve, reject);
	},
	drop_in_container:function(moved_item, selected_items, orders, resolve, reject){
		var self = this;
		this.display_load("Moving Content...", function(resolve_main, reject_main){
            try{
                /* Step 1: Get sort orders updated */
				var max = 1;
				var min = 1;
				var index = orders.indexOf(moved_item);
				if(index >= 0){
					min = (index === 0)? 0 : orders.at(index - 1).get("sort_order");
					max = (index === orders.length - 1)? min + 2 : orders.at(index + 1).get("sort_order");
					var updated_collection = new Models.ContentNodeCollection();
					selected_items.forEach(function(node){
						min = (min + max) / 2;
						node.set({
							"sort_order": min,
							"changed" : true
						});
						updated_collection.push(node.clone());
					});
					selected_items = updated_collection;
				}else{
					resolve_main("Success!");
				}

			/* Step 2: Handle nodes from another parent if needed */
				var promise = new Promise(function(resolve1, reject1){
					if(orders.findWhere({id: moved_item.id})){
						self.handle_transfer_drop(selected_items, resolve1, reject1);
					}
				});
				promise.then(function(collections){
					selected_items = collections.collection;
					original_parents = collections.original_parents;

			/* Step 3: Save nodes */
					var second_promise = new Promise(function(resolve2, reject2){
						selected_items.save(resolve2, reject2);
					});
					second_promise.then(function(){
			 /* Step 4: Reload page to render changes */
			 			var last_elem = $("#" + moved_item.id);
						selected_items.forEach(function(node){
							var to_delete = $("#" + node.id);
							var item_view = self.create_new_item(node);
							last_elem.after(item_view.el);
							last_elem = item_view.$el;
							self.views.push(item_view);
							to_delete.remove();
						});
						var reload_list = new Models.ContentNodeCollection(reload_list);
						reload_list.add(original_parents.models.concat(selected_items.models));
						self.reload_listed(reload_list);
						resolve(resolve_main);
					}).catch(function(error){
						console.log(error)
						reject(error);
						reject_main(error);
					});
				}).catch(function(error){
					if(self.container){
						self.container.render();
					}
					reject(error);
					reject_main(error);
				});

            }catch(error){
                reject(error);
                reject_main(error);
            }
        });
	},

	remove_view: function(view){
		this.views.splice(this.views.indexOf(this), 1);
		view.delete_view();
	},
	add_nodes:function(collection, startingIndex, resolve, reject){
		var self = this;
		var promise = new Promise(function(resolve, reject){
			collection.move(self.model, startingIndex, resolve, reject);
		});
		promise.then(function(){
			self.list_index = startingIndex;
			collection.add(self.model);
			self.reload_listed(collection);
			self.render();
			resolve(collection);
		}).catch(function(error){
			reject(error)
		});

	},
	add_topic: function(event){
		var UploaderViews = require("edit_channel/uploader/views");
		var self = this;
		var new_topic = this.collection.create({
            "kind":"topic",
            "title": "Topic",
            "sort_order" : this.collection.length,
            "author": window.current_user.get("first_name") + " " + window.current_user.get("last_name")
        }, {
        	success:function(new_topic){
        		new_topic.set({
		            "original_node" : new_topic.get("id"),
		            "cloned_source" : new_topic.get("id")
		        });
		        var edit_collection = new Models.ContentNodeCollection(new_topic);
		        $("#main-content-area").append("<div id='dialog'></div>");

		        var metadata_view = new UploaderViews.EditMetadataView({
		            el : $("#dialog"),
		            collection: edit_collection,
		            parent_view: self,
		            model: new_topic,
		            allow_add: false,
		            new_topic: true,
		            main_collection : self.collection,
		            modal: true
		        });
        	},
        	error:function(obj, error){
        		console.log("Error creating topic", obj);
                console.log("Error message:", error);
                console.trace();
        	}
        });
	},
	import_content:function(){
		var Import = require("edit_channel/import/views");
        var import_view = new Import.ImportModalView({
            modal: true,
            callback: this.import_nodes,
            model: this.model
        });
    },
    import_nodes:function(collection){
        this.reload_listed(collection);
        this.render();
    },
    add_files:function(){
    	var FileUploader = require("edit_channel/file_upload/views");
    	this.file_upload_view = new FileUploader.FileModalView({
            parent_view: this,
            model:this.model
    	})
    },
    assign_indices:function(){
    	var self = this;
    	this.views = [];
    	this.$el.find("." + this.item_class).each(function(index, item){
    		var view = $(item).data("data");
    		view.index = index;
    		self.views.push(view);
    		self.list_index = index + 1;
    	});
    },
    handle_transfer_drop:function(transfer_collection, resolve, reject){
		var self = this;
		var original_parents = new Models.ContentNodeCollection();
		var fetch_collection = [];
		var updated_collection = new Models.ContentNodeCollection();
		transfer_collection.forEach(function(node){
			if(node.get("parent") != self.model.id){
				if(fetch_collection.indexOf(node.get("parent")) < 0){
					fetch_collection.push(node.get("parent"));
				}
				node.set("parent", self.model.id);
			}
			updated_collection.push(node.clone());
		});
		original_parents = original_parents.get_all_fetch(fetch_collection);
		resolve({"collection" : updated_collection,
				"original_parents" : original_parents});
    }
});


var BaseListItemView = BaseView.extend({
	containing_list_view:null,
	set_editing: function(edit_mode_on){
		this.containing_list_view.set_editing(edit_mode_on);
	},
	remove_item:function(){
		this.containing_list_view.remove_view(this);
	}
});

var BaseListNodeItemView = BaseListItemView.extend({
	delete:function(){
    	if(!this.model){
    		this.delete_view();
    	}
		if(this.containing_list_view.item_view != "uploading_content"){
			this.add_to_trash();
		}
	},
	save: function(data, options){
    	if(!this.model){
    		var node_data = new Models.ContentNodeModel(data);
			this.containing_list_view.collection.create(node_data, options);
			if(this.model.get("kind").toLowerCase() != "topic"){
				node_data.create_file();
			}
    	}
		else{
			this.model.save(data, options);
			if(this.model.get("kind") && this.model.get("kind").toLowerCase() != "topic"){
				this.model.create_file();
			}
		}
	},
	set:function(data, options){
		if(!this.model){
    		var node_data = new Models.ContentNodeModel(data);
			this.containing_list_view.collection.create(node_data, options);
			if(this.model.get("kind").toLowerCase() != "topic"){
				node_data.create_file();
			}
    	}else{
    		this.model.set(data, options);
    	}
	},
	open_edit:function(){
		var UploaderViews = require("edit_channel/uploader/views");
		var edit_collection = new Models.ContentNodeCollection();
		edit_collection.add(this.model);

		$("#main-content-area").append("<div id='dialog'></div>");

		var metadata_view = new UploaderViews.EditMetadataView({
			collection: edit_collection,
			parent_view: this,
			el: $("#dialog"),
			allow_add : false,
			main_collection: this.containing_list_view.collection,
			modal:true,
			model: this.model
		});
	},
	handle_hover:function(event){
		this.hover_open_folder(event);
	},
	handle_drop:function(models, resolve, reject){
		var self = this;
		var tempCollection = new Models.ContentNodeCollection();
		var sort_order = this.model.get("metadata").max_sort_order;
		var reload_list = [];

		this.display_load("Moving Content...", function(resolve_main, reject_main){
			console.log("FROM HANDLE DROP")
            try{
                models.forEach(function(node){
					node.set({
						parent: self.model.id,
						sort_order: ++sort_order
					});
					tempCollection.add(node);
				});
				var promise = new Promise(function(resolve1, reject1){
					tempCollection.save(resolve1, reject1);
				});
				promise.then(function(){
					self.reload();
					resolve(resolve_main);
				}).catch(function(error){
					reject(error);
					self.containing_list_view.render();
				});

            }catch(error){
                reject(error);
                reject_main(error);
            }
        });
	},
});

var BaseListChannelItemView = BaseListItemView.extend({
	delete:function(){
		if(!this.model){
    		this.delete_view();
	    }else{
	    	this.model.save({"deleted":true});
	    	this.delete_view();
	    }
	},
	save: function(data, options){
    	if(!this.model){
    		this.model = new Models.ChannelModel(data);
    		this.containing_list_view.collection.create(this.model, options);
    	}else{
    		this.model.save(data, options);
    	}
	}
});

var BaseEditorView = BaseListView.extend({
	multiple_selected: false,
	current_node: null,
	item_view:"uploading_content",
	unsaved_queue: [], // Used to keep track of temporary model data
	errorsFound : false,
	parent_view : null,
	close_uploader: function(event){
		if(this.unsaved_queue.length === 0){
			if (this.modal) {
				this.$el.modal('hide');
	        }else{
	        	this.callback();
	        }

	        this.remove();
		}else if(confirm("Unsaved Metadata Detected! Exiting now will"
			+ " undo any new changes. \n\nAre you sure you want to exit?")){
			if(!this.allow_add){
				this.views.forEach(function(entry){
					entry.unset_node();
				});
			}
			if (this.modal) {
				this.$el.modal('hide');
	        }
	        this.unsaved_queue = [];
	        this.views = [];
	        if(this.modal){
	        	this.remove();
	        }else{
	        	this.callback();
	        }

		}else{
			event.stopPropagation();
			event.preventDefault();
		}
		if(!this.allow_add){
        	var reload_collection = new Models.ContentNodeCollection();
	        this.views.forEach(function(entry){
	        	reload_collection.add(entry.model);
			});
			this.reload_listed(reload_collection);
	    }
	},
	save_nodes: function(resolve, reject){
		var self = this;

		var promise = new Promise(function(resolve, reject){
			self.parent_view.set_editing(false);
			var stringHelper = require("edit_channel/utils/string_helper");
			self.views.forEach(function(entry){
				var tags = [];
				entry.tags.forEach(function(tag){
					tags.push("{\"tag_name\" : \"" + tag.replace(/\"/g, "\\\"") + "\",\"channel\" : \"" + window.current_channel.get("id") + "\"}");
				})
				entry.model.set({tags: tags});
				if(entry.format_view){
					entry.format_view.update_file();
					entry.format_view.clean_files();
				}
		        entry.set_edited(false);
			});
			self.errorsFound = self.errorsFound || !self.save_queued();
			self.collection.save(resolve, reject);
		});
		promise.then(function(){
			resolve(true);
		}).catch(function(error){
			reject(error);
		});
	},
	check_nodes:function(){
		var self = this;
		self.errorsFound = false;
		this.views.forEach(function(entry){
			entry.model.set(entry.model.attributes, {validate:true});
			if(entry.model.validationError){
				self.handle_error(entry);
				self.errorsFound = true;
			}
		});
	},
	set_node_edited:function(){
		this.enqueue(this.current_view);
		this.current_view.set_edited(true);
		this.current_view.set_node();
		this.current_view.render();
	},
	enqueue: function(view){
		var index = this.unsaved_queue.indexOf(view);
		if(index >= 0)
			this.unsaved_queue.splice(index, 1);
		this.unsaved_queue.push(view);
	},
	save_queued:function(){
		var self = this;
		var success = true;
		this.unsaved_queue.forEach(function(entry){
			entry.model.set(entry.model.attributes, {validate:true});
			if(entry.format_view){
				entry.model.set("files", entry.format_view.model.get("files"));
			}
			if(entry.model.validationError){
				self.handle_error(entry);
				success = false;
			}else{
				self.unsaved_queue.splice(self.unsaved_queue.indexOf(entry), 1);
			}
		});

		/*Make sure queue is cleared*/
		if(success){
			this.unsaved_queue.forEach(function(entry){
				self.views.push(self.unsaved_queue.pop());
			});
		}
		return success;
	}
});

var BaseModalView = BaseView.extend({
    callback:null,
    close: function() {
    	if(this.modal){
    		this.$(".modal").modal('hide');
    	}

        this.remove();
    }
});

module.exports = {
	BaseView: BaseView,
	BaseListView:BaseListView,
	BaseListItemView:BaseListItemView,
	BaseListChannelItemView: BaseListChannelItemView,
	BaseListNodeItemView:BaseListNodeItemView,
	BaseEditorView:BaseEditorView,
	BaseModalView:BaseModalView
}
