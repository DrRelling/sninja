gs.include("JSON");
var SNinja = Class.create();

SNinja.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getUserPermission : function(){
		return gs.getPreference("sninja.run", false);
	},

	getACValues : function(){
		var tableRec = new GlideRecord('sys_documentation');
		tableRec.addQuery('element=NULL^nameNOT LIKEts_c^language=en^nameNOT LIKE0');
		tableRec.query();
		var searches = {
			tables: [],
			modules: [],
			bookmarks: []
		};

		while(tableRec.next()) {
			searches.tables.push({
				value : tableRec.name.toString(),
				section : 'Tables',
				type : 'table',
				tokens : [tableRec.name.toString(), tableRec.label.toString()]
			});
		}

		var moduleRec = new GlideRecord('sys_app_module');
		moduleRec.addEncodedQuery(
			'link_typeINLIST,NEW,REPORT,SCRIPT,DETAIL,DIRECT^active=true'
		);
		moduleRec.query();

		while(moduleRec.next()) {
			searches.modules.push({
				value : moduleRec.title.getDisplayValue().toString() + " (" + moduleRec.application.getDisplayValue() + ")",
				title : moduleRec.title.getDisplayValue().toString(),
				section : moduleRec.application.getDisplayValue(),
				type : moduleRec.link_type.toString().toLowerCase(),
				tokens : [moduleRec.title.getDisplayValue()],
				link : moduleRec.name.toString(),
				id : moduleRec.sys_id.toString(),
				parms : moduleRec.filter.toString(),
				view : moduleRec.view_name.toString(),
				report : moduleRec.report.toString(),
				args : moduleRec.query.toString()
			});
		}

		var bookmarkRec = new GlideRecord("sys_ui_bookmark");
		bookmarkRec.addQuery("user", gs.getUserID());
		bookmarkRec.orderBy("order");
		bookmarkRec.query();

		while (bookmarkRec.next()) {
			searches.bookmarks.push({
				link: bookmarkRec.url.toString(),
				tokens: [bookmarkRec.title.toString()],
				type: 'bookmark',
				value: bookmarkRec.title.toString().replace(/\./g, " ")
			});
		}

		return new JSON().encode(searches);
	},

	getHistoryValues: function () {
		var searches = [];
		var historyRec = new GlideRecord("sys_ui_navigator_history");
		historyRec.addQuery("sys_created_by", gs.getUser().name);
		historyRec.orderByDesc("sys_created_on");
		historyRec.setLimit(20);
		historyRec.query();
		var title;
		while (historyRec.next()) {
			searches.push({
				link: historyRec.url.toString(),
				tokens: [historyRec.title.toString(), historyRec.description.toString()],
				type: 'history',
				title: historyRec.title.toString(),
				description: historyRec.description.toString().replace(/\./g, " ")
			});
		}
		
		return new JSON().encode(searches);
	}

});