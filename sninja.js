var sninja;

(function($) {

	sninja = {
		boundKey: (navigator.language == "en-GB"
					&& typeof InstallTrigger == 'undefined')
						? 223
						: 192, // US / UK keyboards have different keycodes for ` in Chrome and FireFox
		newTab: false,
		searching: [{"name": "Open", "icon": "icon-all-apps"},
					{"name": "Bookmarks", "icon": "icon-star-empty"},
					{"name": "History", "icon": "icon-history"}],
		visible: false,
		suggestion: '',
		bloodhound: {},
		tabCount: 0,
		mode: 'default',
		search: {},
		commandArray: [],
		commandIndex: 0,
		commands: {

			"help": {
				"context": "any",
				"description": "Opens the help page.\n\nUsage: sninja.help",
				"command": function() {
					var link = location.origin + "/ui_page.do?sys_id=7fb87cbd4f1332001db78c318110c7b4";
					window.open(link, "", "toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes");
				}
			},

			"list": {
				"context": "table",
				"description": "Opens an unfiltered list of records for the specified table.\n\nUsage:\n[table name].list",
				"command": function(item, newWindow) {
					sninja.openWindow(item + "_list.do", newWindow);
				}
			},

			"form": {
				"context": "table",
				"description": "Opens a new form for the specified table.\n\nUsage:\n[table name].form",
				"command": function(item, newWindow) {
					sninja.openWindow(item + ".do", newWindow);
				}

			},

			"dict": {
				"context": "table",
				"description": "Opens the dictionary entry for the specified table.\n\nUsage:\n[table name].dict",
				"command": function(item, newWindow) {
					sninja.openWindow("sys_dictionary_list.do?sysparm_query=name=" + item, newWindow);
				}
			},

			"filter": {
				"context": "table",
				"description": "Opens filter for the specified table.\n\nUsage:\n[table name].filter",
				"command": function (item, newWindow) {
					sninja.openWindow(item + "_list.do?sysparm_filter_only=true");
				}
			},

			"recent": {
				"context": "table",
				"description": "Opens a list of items updated today for this table.\n\nUsage:\n[table name].recent",
				"command": function(item, newWindow) {
					sninja.openWindow(item + "_list.do?sysparm_query=sys_updated_onONToday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)", newWindow);
				}
			},

			"do": {
				"context": "any",
				"description": "Opens the .do for the specified table.\n\nUsage:\n[table name].do",
				"command": function(item, newWindow) {
					sninja.openWindow(item + ".do", newWindow);
				}
			},

			"open": {
				"context": "any",
				"command": function(item, newWindow, suggestion) {
					var link = "";

					if (suggestion.type == "direct") {
						link = suggestion.args;
					} else if (suggestion.type == "list") {
						link = suggestion.link + "_list.do?" + ["sysparm_query=" + suggestion.parms, "sysparm_view=" + suggestion.view].join("&");
					} else if (suggestion.type == "new") {
						link = suggestion.link + ".do?sysparm_id=-1&" + ["sysparm_query=" + suggestion.parms, "sysparm_view=" + suggestion.view].join("&");
					} else if (suggestion.type == "report") {
						link = "sys_report_template.do?jvar_report_id=" + suggestion.report + "&sysparm_from_list=true";
					} else if (suggestion.type == "detail") {
						link = suggestion.link + ".do?sysparm_query=" + suggestion.args + "&sysparm_view=" + suggestion.view;
					} else if (suggestion.type == "script") {
						newWindow = true;
						link = "sys.scripts.do?action=run_module&sys_id=" + suggestion.id;
					} else if (suggestion.type == "bookmark" ||
							   suggestion.type == "history") {
						link = suggestion.link;
					}
					
					if (link !== "") {
						sninja.openWindow(link, newWindow);
					}
				}
			},

			"br" : {
				"context" : "any",
				"description": "Opens the list of business rules for the specified table.\n\nUsage:\n[table name].br",
				"command" : function(item, newWindow){
					sninja.openWindow("sys_script_list.do?sysparm_query=collection=" + item, newWindow);
				}
			},

			"cs" : {
				"context" : "any",
				"description": "Opens the list of client scripts for the specified table.\n\nUsage:\n[table name].cs",
				"command" : function(item, newWindow){
					sninja.openWindow("sys_client_script_list.do?sysparm_query=table=" + item, newWindow);
				}
			},

			"acl" : {
				"context" : "any",
				"description": "Opens the list of ACLs for the specified table.\n\nUsage:\n[table name].acl",
				"command" : function(item, newWindow){
					sninja.openWindow("sys_security_acl_list.do?sysparm_query=nameSTARTSWITH" + item, newWindow);
				}
			},

			"act" : {
				"context" : "any",
				"description": "Opens the list of UI actions for the specified table.\n\nUsage:\n[table name].act",
				"command" : function(item, newWindow){
					sninja.openWindow("sys_ui_action_list.do?sysparm_query=table=" + item, newWindow);
				}
			},

			"pol" : {
				"context" : "any",
				"description": "Opens the list of UI policies for the specified table.\n\nUsage:\n[table name].pol",
				"command" : function(item, newWindow){
					sninja.openWindow("sys_ui_policy_list.do?sysparm_query=table=" + item, newWindow);
				}
			},      

			"search" : {
				"description": "Searches the specified table for a string.\n\nUsage:[table name][tab][search string][return]",
				"command" : function(item){
					sninja.openWindow(item[0] + "_list.do?sysparm_query=123TEXTQUERY321=" + item[2], false);
				}                
			}      
		},

		openWindow : function(link, newWindow){
			if (!newWindow) {
				newWindow = sninja.newTab;
			}
			if(!newWindow){
				sninja.getMainWindow().location = link;
			} else {
				window.open(link);
			}
		},

		getTable : function(){
			var table = sninja.getMainWindow().location.pathname.toString().split('.do')[0];
			table = table.replace("/","");
			table = table.replace("_list","");

			return table;
		},

		init: function() {
			for (var key in sninja.commands) {
				if (sninja.commands.hasOwnProperty(key)) {
					sninja.commandArray.push(key);
				}
			}
			this.getUserPermission();
		},

		startSninja: function() {
			this.addSearch();
			this.bindKeys();

			var data = localStorage["searchData"];

			if(!data){
				this.getACValues();
			} else {
				sninja.search = JSON.parse(data);
				console.log("sninja - Loaded AC Values From Cache");
			}

			// get history
			var ga = new GlideAjax("SNinja");
			ga.addParam('sysparm_name', 'getHistoryValues');
			ga.getXML(function(response) {
				var data = response.responseXML.documentElement.getAttribute("answer");
				sninja.search.history = JSON.parse(data);
				sninja.bloodhound.history = new Bloodhound({
					datumTokenizer: function(d) {
						return Bloodhound.tokenizers.whitespace(d.tokens.join(' '));
					},
					queryTokenizer: Bloodhound.tokenizers.whitespace,
					local: sninja.search.history
				});
				sninja.bloodhound.history.initialize();
				sninja.rebindTypeahead();
				console.log("Loaded history");
			});
			sninja.initializeTypeahead();
		},

		getMainWindow: function() {
			var mainWindow = getMainWindow();

			if (mainWindow === undefined) {
				return self;
			} else {
				return mainWindow;
			}

		},

		bindKeys: function() {
			$(document).on('keydown', function (event) {
				if (event.which == sninja.boundKey) {
					if (!sninja.visible) {
						event.preventDefault();
						event.stopPropagation();
						sninja.newTab = false;
						$("#sninja_new_tab_icon").css("display", "none");
						$("#sninja_searching_icon").removeClass();
						$("#sninja_searching_icon").addClass("icon icon-all-apps");
						sninja.loadSearch();
					} else if (!$("#sninja_search").is(":focus")) {
						$("#sninja_search").focus();
						event.preventDefault();
						event.stopPropagation();
					}
				}
			});
			$("#sninja_search").on('keydown', this.processEvent);
			$("#sninja_search").on('keyup', this.processEventUp);
		},

		processEventUp: function(event) {
			if (sninja.visible) {
				if ($("#sninja_search").is(":focus")) {
					var command = $("#sninja_search").val().split(".");
					if(command == "refresh") {
						sninja.getACValues();
						sninja.reset();
					}
					if (command.length == 2) {
						if (sninja.commands[command[1]]) {
							sninja.run_command(command);
						}
					}
				}
			}
		},
		
		processEvent: function(event) {
			if (!$("#sninja_search").is(":focus")) {
				// this shouldn't be necessary
				// but the workflow search field keeps acting like it's SNinja??
				return;
			}
			var textVal = $("#sninja_search").val();
			if (event.which == sninja.boundKey) {
				event.preventDefault();
				event.stopPropagation();
				sninja.newTab = !sninja.newTab;
				if (sninja.newTab) {
					$("#sninja_new_tab_icon").css("display", "block");
				} else {
					$("#sninja_new_tab_icon").css("display", "none");
				}
			} else if (event.which == 27) { // escape
				sninja.closeSearch();
				event.preventDefault();
				event.stopPropagation();
				sninja.reset();
			} else if (event.which == 13) { // enter
				if ($("#sninja_search").is(":focus")) {
					if(sninja.mode == 'search'){
						textVal = textVal.replace("Search ","");
						var terms = textVal.split(":");
						command = [terms[0],'search',terms[1]];
						sninja.run_command(command);
						sninja.reset();
					} else if (sninja.searching[0].name == "Bookmarks" || sninja.searching[0].name == "History") {
						sninja.search_partial_match(textVal);
						command = textVal.split(".");
						var response = sninja.run_command(command);
					} else if (sninja.suggestion || textVal == "help") {
						command = textVal.split(".");
						sninja.run_command(command);							
					} else {
						sninja.search_partial_match(textVal);
					} 		
				}
			} else if (event.which == 190) {
				var term = $("#sninja_search").val().split(".")[0];
				sninja.search_for_command(term);
			} else if (event.which == 9) { // tab
				if (typeof sninja.suggestion == 'object' &&
					sninja.tabCount == 1) {
					$("#sninja_search").val("Search " + textVal + ": ");
					sninja.tabCount = 2;
					sninja.mode = 'search';
				} else {
					sninja.search_partial_match(textVal);
				}
				event.preventDefault();
				event.stopPropagation();
			} else if (event.which == 32 && textVal.length == 0) { // space
				event.preventDefault();
				event.stopPropagation();
				sninja.searching.push(sninja.searching.shift()); // cycle values				
				$("#sninja_searching_icon").removeClass();
				$("#sninja_searching_icon").addClass("icon " + sninja.searching[0].icon);
				sninja.rebindTypeahead();
			} else if (event.which == 192 || event.which == 8) {
				sninja.tabCount = 0;
				sninja.mode = 'default';
				sninja.suggestion = '';
			}
		},

		search_for_command: function(term) {
			switch (sninja.searching[0].name) {
				case "Open":
					sninja.bloodhound.tables.get(term, function(suggestions) {
						suggestions.each(function(suggestion) {
							if (suggestion.value == term) {
								sninja.suggestion = suggestion;
							}
						});
					});

					sninja.bloodhound.modules.get(term, function(suggestions) {
						suggestions.each(function(suggestion) {
							if (suggestion.value == term) {
								sninja.suggestion = suggestion;
							}
						});
					});
					break;

				case "Bookmarks":
					sninja.bloodhound.bookmarks.get(term, function(suggestions) {
						suggestions.each(function(suggestion) {
							if (suggestion.value == term) {
								sninja.suggestion = suggestion;
							}
						});
					});
					break;

				case "History":
					sninja.bloodhound.history.get(term, function(suggestions) {
						suggestions.each(function(suggestion) {
							if (suggestion.value == term) {
								sninja.suggestion = suggestion;
							}
						});
					});
			}
			return false;
		},

		search_partial_match: function(term) {
			sninja.tabCount = 1;			
			switch (sninja.searching[0].name) {
				case "Open":
					var foundSomething = false;
					sninja.bloodhound.tables.get(term, function(suggestions) {
						if (suggestions.length !== 0) {
							$("#sninja_search").typeahead('val', suggestions[0].value);
							sninja.suggestion = suggestions[0];
							foundSomething = true;
						}
					});
					
					if (!foundSomething) {
						sninja.bloodhound.modules.get(term, function(suggestions) {
							if (suggestions.length !== 0) {
								$("#sninja_search").typeahead('val', suggestions[0].value);
								sninja.suggestion = suggestions[0];
							}
						});
					}
					
					break;

				case "Bookmarks":
					sninja.bloodhound.bookmarks.get(term, function(suggestions) {
						if (suggestions.length !== 0) {
							$("#sninja_search").typeahead('val', suggestions[0].value);
							sninja.suggestion = suggestions[0];
						}
					});
					break;

				case "History":
					sninja.bloodhound.history.get(term, function(suggestions) {
						if (suggestions.length !== 0) {
							$("#sninja_search").typeahead('val', suggestions[0].value);
							sninja.suggestion = suggestions[0];
						}
					});
					break;
			}
		},

		run_command: function(command) {
			if (command.length == 1) command.push("open");
			if( command[0] == "current" ) command[0] = sninja.getTable();

			if (sninja.suggestion == '') sninja.suggestion = {
				value: command[0],
				type: "table"
			};

			var commandName = command[1].toLowerCase();
			if(commandName == 'search'){
				sninja.commands[commandName].command(command);
			} else if (command[0] == "help") {
				sninja.commands["help"].command();
			} else if (sninja.commands[commandName].context == sninja.suggestion.type || sninja.commands[commandName].context == "any") {
				sninja.commands[commandName].command(sninja.suggestion.value, command[1] === command[1].toUpperCase(), sninja.suggestion);
			}
			sninja.closeSearch();
		},

		reset: function() {
			$("#sninja_search").typeahead('val', '');
			sninja.searching = [{"name": "Open", "icon": "icon-all-apps"},
					{"name": "Bookmarks", "icon": "icon-star-empty"},
					{"name": "History", "icon": "icon-history"}];
			sninja.suggestion = "";
			sninja.tabCount = 0;
			sninja.mode = 'default';
			sninja.commandIndex = 0;            
		},

		closeSearch: function() {
			sninja.reset();
			sninja.visible = false;
			$('.sninja').fadeOut(100);
		},

		loadSearch: function() {
			sninja.suggestion = '';
			$("#sninja_search").typeahead('val', '');			
			$("#sninja_search").attr("placeholder", "Type 'sninja.help' for help");
			sninja.visible = true;

			$('.sninja').fadeIn(50, function() {
				$("#sninja_search").focus();
			});
		},

		addSearch: function() {
			var container = $("<div></div>")
			.addClass("sninja")
			.addClass("sninja-search-container")
			.appendTo("body");
			$("<span></span>")
				.attr("id", "sninja_searching_icon")
				.addClass("icon")
				.addClass("icon-all-apps")
				.css({"font-size": "30px",
					  "display": "block",
					  "float": "right"})
				.appendTo(container);
			$("<input></input>")
				.attr("id", "sninja_search")
				.addClass("sninja-search-box")
				.addClass("typeahead")
				.appendTo(container);
			$("<span></span>")
				.attr("id", "sninja_new_tab_icon")
				.addClass("icon")
				.addClass("icon-add-circle")
				.css({"font-size": "30px",
					  "display": "none",
					  "float": "right"})
				.appendTo(container);
		},

		initializeTypeahead: function() {
			sninja.bloodhound.tables = new Bloodhound({
				datumTokenizer: function(d) {
					return Bloodhound.tokenizers.whitespace(d.tokens.join(' '));
				},
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				sorter: function(a, b) {

					if (a.value.length < b.value.length) {
						return -1;
					}
					if (a.value.length > b.value.length) {
						return 1;
					}

					return 0;
				},
				local: sninja.search.tables
			});

			sninja.bloodhound.modules = new Bloodhound({
				datumTokenizer: function(d) {
					return Bloodhound.tokenizers.whitespace(d.tokens.join(' '));
				},
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				local: sninja.search.modules
			});

			sninja.bloodhound.bookmarks = new Bloodhound({
				datumTokenizer: function(d) {
					return Bloodhound.tokenizers.whitespace(d.tokens.join(' '));
				},
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				local: sninja.search.bookmarks
			});

			sninja.bloodhound.tables.initialize();
			sninja.bloodhound.modules.initialize();
			sninja.bloodhound.bookmarks.initialize();

			$('#sninja_search').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			}, {
				name: 'tables',
				displayKey: 'value',
				source: sninja.bloodhound.tables.ttAdapter(),
				templates: {
					suggestion: Handlebars.compile('<p><strong>{{value}}</strong></p>')
				}
			}, {
				name: 'modules',
				displayKey: 'value',
				source: sninja.bloodhound.modules.ttAdapter(),
				templates: {
					suggestion: Handlebars.compile('<p><strong>{{title}}</strong> ({{section}})</p>')
				}
			}).bind('typeahead:selected', function(obj, datum, name) {
				sninja.suggestion = datum;
			}).bind('typeahead:autocompleted', function(obj, datum, name) {
				sninja.suggestion = datum;
			}).bind('typeahead:cursorchanged', function(obj, datum, name) {
				sninja.suggestion = datum;
			});			
		},

		rebindTypeahead: function () {
			$("#sninja_search").attr("placeholder", sninja.searching[0].name);
			$("#sninja_search").typeahead("destroy");
			switch (sninja.searching[0].name) {
				case "Open":
					$('#sninja_search').typeahead({
						hint: true,
						highlight: true,
						minLength: 1
					}, {
						name: 'tables',
						displayKey: 'value',
						source: sninja.bloodhound.tables.ttAdapter(),
						templates: {
							suggestion: Handlebars.compile('<p><strong>{{value}}</strong></p>')
						}
					}, {
						name: 'modules',
						displayKey: 'value',
						source: sninja.bloodhound.modules.ttAdapter(),
						templates: {
							suggestion: Handlebars.compile('<p><strong>{{title}}</strong> ({{section}})</p>')
						}
					});
					break;
				case "Bookmarks":
					$("#sninja_search").typeahead({
						hint: true,
						highlight: true,
						minLength: 1
					}, {
						name: 'bookmarks',
						displayKey: 'value',
						source: sninja.bloodhound.bookmarks.ttAdapter(),
						templates: {
							suggestion: Handlebars.compile('<p><strong>{{value}}</strong></p>')}
					});
					break;
				case "History":
					if (typeof sninja.bloodhound.history != "undefined") {
						$("#sninja_search").typeahead({
							hint: true,
							highlight: true,
							minLength: 1
						}, {
							name: 'history',
							displayKey: 'description',
							source: sninja.bloodhound.history.ttAdapter(),
							templates: {
								suggestion: Handlebars.compile('<p><strong>{{title}}</strong> ({{description}})</p>')}
						});
					} else {
						$("#sninja_search").attr("placeholder", "History - loading...");
					}
					break;
			}
			// reloading typeahead causes it to lose focus - known bug
			setTimeout(function () {
				$("#sninja_search").focus();
			}, 0);
		},

		getACValues: function() {
			var ga = new GlideAjax("SNinja");
			ga.addParam('sysparm_name', 'getACValues');
			console.log("sninja - Loading AC Values");
			ga.getXML(function(response) {
				var data = response.responseXML.documentElement.getAttribute("answer");
				localStorage["searchData"] = data;
				sninja.search = JSON.parse(data);
			});
		},

		getUserPermission: function() {
			var ga = new GlideAjax("SNinja");
			ga.addParam('sysparm_name', 'getUserPermission');

			ga.getXML(function(response) {
				var data = response.responseXML.documentElement.getAttribute("answer") == "true";
				if (data == true) {
					sninja.startSninja();
				}
			});
		}
	};

	$(document).ready(function() {
		sninja.init();
	});

})(jQuery);