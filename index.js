const { Perm, permAdmin } = Msa.require("user/perm")

// register ///////////

const AdminPanels = []
const AdminPanelsRouter = Msa.express.Router()

class AdminPanel {
	constructor(kwargs) {
		for (let k of ["route", "app", "title"])
			if (kwargs[k] === undefined)
				throw `Missing arg "${k}"`
		Object.assign(this, kwargs)
	}
}
const AdminPanelPt = AdminPanel.prototype

AdminPanelPt.perm = permAdmin

function registerAdminPanel(kwargs) {
	const panel = new AdminPanel(kwargs)
	AdminPanels.push(panel)
	const mdw = Msa.express.Router()
	AdminPanelsRouter.use(panel.route, mdw)
	mdw.use(panel.perm.checkPage())
		.use(panel.app)
}

// register shell
registerAdminPanel({
	route: '/sh',
	app: require('./sh').app,
	title: "Shell",
	help: "Shell panel"
})

// admin module

class MsaAdminModule extends Msa.Module {

	constructor(...args) {
		super(...args)
		this.initApp()
	}

	initApp() {
		// user
		this.app.use(userMdw)

		// panels
		this.app.use(AdminPanelsRouter)

		// root get
		this.app.get('/', (req, res, next) => {
			const authPanels = AdminPanels.filter(p => p.perm.check(req.session.user))
			if (authPanels.length === 0) {
				res.sendPage(unauthHtml)
			} else {
				let html = "<ul>"
				authPanels.forEach(p => {
					const href = joinUrl(req.baseUrl, p.route)
					html += `<li><a href="${href}">${p.title}</a></li>`
				})
				html += "</ul>"
				res.sendPage(html)
			}
		})
	}
}

// export

module.exports = {
	startMsaModule: () => new MsaAdminModule(),
	MsaAdminModule,
	registerAdminPanel
}

// import

const { unauthHtml, userMdw } = Msa.require("user")

// utils

const { joinUrl } = Msa
