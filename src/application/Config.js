class Config {

	constructor(params) {
		this.applicationName = params.applicationName ?? 'MyApplication';
		this.debug = params.debug ?? false;
	}

}