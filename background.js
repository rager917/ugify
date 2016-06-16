{
		chrome.webRequest.onHeadersReceived.addListener(
			function(details) {
				if (details.url.includes('/cics/wmn/wmngrad')) {
					for (const h of details.responseHeaders)
						if (h.name.toLowerCase() == 'content-type') {
							h.value = 'text/html; charset=logical';
						}
				}
				return {responseHeaders: details.responseHeaders};
			},
			{urls: ["http://techmvs.technion.ac.il/*"]},
			['blocking', 'responseHeaders']
		);

}