var md = {
	runCommands: Module.cwrap('runCommands', 'void', ['string']),
	reset: Module.cwrap('reset', 'void', []),
	runDefaultScript: Module.cwrap('runDefaultScript', 'void', [])
}

md.reset()
md.runDefaultScript()