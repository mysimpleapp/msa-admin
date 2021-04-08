import { Q, importHtml, ajax } from "/msa/utils/msa-utils.js"

importHtml(`<style>
	msa-admin-sh input {
		margin: 5px;
	}
	msa-admin-sh .output {
		margin: 10px;
		padding: 5px;
		min-height: 200px;
		border: 1px solid black;
	}
	msa-admin-sh .output .req {
		color: grey;
		font-style: italic;
	}
	msa-admin-sh .output .stdout {
		white-space: pre-wrap;
	}
	msa-admin-sh .output .stderr {
		white-space: pre-wrap;
    color: red;
	}
</style>`)

const content = `
	<h1 style="text-align:center">Shell</h1>
	<div style="display:flex; flex-direction:row">
		<input class="input" type=text style="flex:1">
		<input class="send" type=button value="Send">
		<input class="clear" type=button value="Clear">
	</div>
	<div class="output"></div>`


export class HTMLMsaAdminShElement extends HTMLElement {

	constructor() {
		super()
		this.cmdCache = []
		this.cmdCacheIte = -1
		this.Q = Q
	}

	connectedCallback() {
		this.initContent()
		this.initActions()
	}

	initContent() {
		this.innerHTML = content
	}

	initActions() {
		this.Q(".send").onclick = () => this.send()
		this.Q(".clear").onclick = () => this.clear()
		this.Q(".input").onkeydown = evt => {
			// arrow up & down: cmd cache
			if(evt.key==="ArrowUp") this.getNextCmdFromCache()
			if(evt.key==="ArrowDown") this.getPrevCmdFromCache()
			// enter: send
			if(evt.key==="Enter") this.send()
		}
	}

	send() {
		var input = this.Q('.input'), output = this.Q('.output')
		var cmd = input.value
		var reqStr = "<div class='req'>> "+cmd+"</div>"
		ajax("POST", "/admin/sh",
			{body:{ cmd:cmd }})
		.then(res => {
			var stdoutStr = res.stdout ? "<xmp class='stdout'>"+res.stdout+"</xmp>" : ""
			var stderrStr = res.stderr ? "<xmp class='stderr'>"+res.stderr+"</xmp>" : ""
			output.innerHTML = reqStr + stdoutStr + stderrStr + output.innerHTML
		})
		input.value = ""
		// fill cache
		if(cmd !== this.cmdCache[0]) this.cmdCache.unshift(cmd)
		this.cmdCacheIte = -1
	}

	clear() {
		this.Q('.output').innerHTML = ""
	}

	getNextCmdFromCache() {
		if(this.cmdCacheIte < this.cmdCache.length-1) {
			this.cmdCacheIte += 1
			this.Q('.input').value = this.cmdCache[this.cmdCacheIte]
		}
	}

	getPrevCmdFromCache() {
		if(this.cmdCacheIte > 0) {
			this.cmdCacheIte -= 1
			this.Q('.input').value = this.cmdCache[this.cmdCacheIte]
		}
	}
}

// register elem
customElements.define("msa-admin-sh", HTMLMsaAdminShElement)
