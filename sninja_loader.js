(function () {
	if (typeof GlideAjax != "undefined") {
		// only show in gsft_main
		console.log('Sninja Starting Loading');
		[
			'958988c62bc0310043ce127c17da15df.cssdbx', // + "?ts=" + new Date().getTime(),
			'https://fonts.googleapis.com/css?family=Open+Sans'
		].forEach(function(src) {
			var link = document.createElement('link');
			link.href = src;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			document.head.appendChild(link);
		});

		[
			'//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.4/typeahead.bundle.min.js',
			//'//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.4/typeahead.bundle.js',
			'//cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js',
			'sninja.jsdbx' // + "?ts=" + new Date().getTime() // add timestamp to avoid caching issues
		].forEach(function(src) {
			var script = document.createElement('script');
			script.src = src;
			script.async = false;
			script.type = 'text/javascript';
			document.head.appendChild(script);
		});

		setTimeout(function(){
			console.log('Sninja Finished Loading');
		},1);

		if (top.sninja)
			top.window.onkeydown = top.sninja.processEvent;

		// navigator
		if (typeof this.GlideAjax != "undefined") {
			this.parent.window.addEventListener(
				"keydown",
				function (e) {
					var boundKey = (navigator.language == "en-GB"
									&& typeof InstallTrigger == 'undefined')
										? 223
										: 192;
					if (e.which == boundKey) {
						sninja.loadSearch();						
						e.preventDefault();
						e.stopPropagation();
					}
				},
				false
			);
			this.window.addEventListener(
				"keydown",
				function (e) {
					var boundKey = (navigator.language == "en-GB"
									&& typeof InstallTrigger == 'undefined')
										? 223
										: 192;
					if (e.which == boundKey && this.sninja.visible == false) {
						sninja.loadSearch();						
						e.preventDefault();
						e.stopPropagation();
					}
				},
				false
			);
		}
	}
})();