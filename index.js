const msaAdmin = module.exports = Msa.module("admin")

const msaUser = Msa.require("user")
msaAdmin.app.use(msaUser.mdw)

// register ///////////

const AdminPanels = []

const DefaultPanel = {
	perm: { group:"admin" }
}

msaAdmin.register = function(kwargs) {
	for(let k of ["route", "app", "title"])
		if(kwargs[k] === undefined)
			throw `Missing arg "${k}"`
	const panel = Object.assign({}, DefaultPanel, kwargs)
	AdminPanels.push(panel)
	msaAdmin.app.use(panel.route, panel.app)
}

// register shell
msaAdmin.register({
	route: '/sh',
	app: require('./sh').app,
	title: "Shell",
	help: "Shell panel"
})

// root get
msaAdmin.app.get('/', (req, res, next) => {
	var html = "<ul>"
	for(var p of AdminPanels){
		if(msaUser.checkUser(req.session.user, p.perm)){
			const href = joinUrl(req.baseUrl, p.route)
			html += `<li><a href="${href}">${p.title}</a></li>`
		}
	}
	html += "</ul>"
	res.partial = Msa.formatHtml(html)
	next()
})

// various

const joinUrl = Msa.joinUrl
