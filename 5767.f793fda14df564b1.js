"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[5767],{5767:(w,f,l)=>{l.r(f),l.d(f,{InfoModule:()=>k,createTranslateLoader:()=>Z});var i=l(604),h=l(6895),u=l(4006),T=l(529),r=l(4032),A=l(9832),g=l(4737),c=l(5861);const d=(0,l(7423).fo)("Browser",{web:()=>l.e(6874).then(l.bind(l,6874)).then(e=>new e.BrowserWeb)});var p=l(65),n=l(8274),I=l(9949);let C=(()=>{class e{constructor(t,o,a){this.globalization=t,this.translate=o,this.modalCtrl=a,this.selectedlang=void 0}ionViewWillEnter(){var t=this;return(0,c.Z)(function*(){let o=yield p.u.get({key:"preflang"});null==o.value?t.globalization.getPreferredLanguage().then(a=>{t.selectedlang=a.value.split("-")[0]}).catch(a=>{t.selectedlang=t.translate.defaultLang}):t.selectedlang=o.value})()}ngOnInit(){}langselected(t){return this.modalCtrl.dismiss(t,"confirm")}}return e.\u0275fac=function(t){return new(t||e)(n.Y36(I._),n.Y36(r.sK),n.Y36(i.IN))},e.\u0275cmp=n.Xpm({type:e,selectors:[["app-change-language"]],decls:16,vars:10,consts:[[1,"inner-content"],[3,"ngModel","ngModelChange"],[3,"click"],["value","en"],["value","de"]],template:function(t,o){1&t&&(n.TgZ(0,"div",0)(1,"h1"),n._uU(2),n.ALo(3,"translate"),n.qZA(),n.TgZ(4,"ion-list")(5,"ion-radio-group",1),n.NdJ("ngModelChange",function(m){return o.selectedlang=m}),n.TgZ(6,"ion-item",2),n.NdJ("click",function(){return o.langselected("en")}),n.TgZ(7,"ion-label"),n._uU(8),n.ALo(9,"translate"),n.qZA(),n._UZ(10,"ion-radio",3),n.qZA(),n.TgZ(11,"ion-item",2),n.NdJ("click",function(){return o.langselected("de")}),n.TgZ(12,"ion-label"),n._uU(13),n.ALo(14,"translate"),n.qZA(),n._UZ(15,"ion-radio",4),n.qZA()()()()),2&t&&(n.xp6(2),n.Oqu(n.lcZ(3,4,"ChangeLanguage.header")),n.xp6(3),n.Q6J("ngModel",o.selectedlang),n.xp6(3),n.Oqu(n.lcZ(9,6,"ChangeLanguage.English")),n.xp6(5),n.Oqu(n.lcZ(14,8,"ChangeLanguage.German")))},dependencies:[i.Ie,i.Q$,i.q_,i.B7,i.se,i.U5,i.QI,u.JJ,u.On,r.X$]}),e})();var b=l(344);const y=[{path:"",component:(()=>{class e{constructor(t,o,a){this.router=t,this.modalCtrl=o,this.translate=a,this.version=b.N.appVersion}wirelesssensorsclick(){return(0,c.Z)(function*(){yield d.open({url:"https://www.we-online.com/en/products/components/service/wireless-connectivity-sensors"})})()}usermanualsclick(){return(0,c.Z)(function*(){yield d.open({url:"https://www.we-online.com/en/products/components/service/wireless-connectivity-sensors?#i2345"})})()}sourcecodeclick(){return(0,c.Z)(function*(){yield d.open({url:"https://github.com/WurthElektronik"})})()}policyclick(){this.router.navigate(["/policy"])}imprintclick(){this.router.navigate(["/imprint"])}whatsnew(){this.router.navigate(["/whatsnew"])}languageclick(){var t=this;return(0,c.Z)(function*(){const o=yield t.modalCtrl.create({component:C});o.cssClass="auto-height",o.animated=!1,o.present();const{data:a,role:m}=yield o.onWillDismiss();"confirm"===m&&(yield p.u.set({key:"preflang",value:a}),t.translate.use(a))})()}}return e.\u0275fac=function(t){return new(t||e)(n.Y36(g.F0),n.Y36(i.IN),n.Y36(r.sK))},e.\u0275cmp=n.Xpm({type:e,selectors:[["app-info"]],decls:57,vars:38,consts:[[3,"translucent"],["color","primary"],[1,"itemwrapnogrow"],[3,"click"],["name","chevron-forward-outline"],[1,"ion-margin-top"]],template:function(t,o){1&t&&(n.TgZ(0,"ion-header",0)(1,"ion-toolbar",1)(2,"ion-title"),n._uU(3),n.ALo(4,"translate"),n.qZA()()(),n.TgZ(5,"ion-content")(6,"ion-list-header"),n._uU(7),n.ALo(8,"translate"),n.qZA(),n.TgZ(9,"ion-list")(10,"ion-item")(11,"ion-label"),n._uU(12),n.ALo(13,"translate"),n.qZA(),n.TgZ(14,"ion-label",2),n._uU(15),n.qZA()(),n.TgZ(16,"ion-item",3),n.NdJ("click",function(){return o.languageclick()}),n.TgZ(17,"ion-label"),n._uU(18),n.ALo(19,"translate"),n.qZA(),n.TgZ(20,"ion-label",2),n._uU(21),n.ALo(22,"translate"),n.qZA()(),n.TgZ(23,"ion-item",3),n.NdJ("click",function(){return o.policyclick()}),n.TgZ(24,"ion-label"),n._uU(25),n.ALo(26,"translate"),n.qZA(),n._UZ(27,"ion-icon",4),n.qZA(),n.TgZ(28,"ion-item",3),n.NdJ("click",function(){return o.imprintclick()}),n.TgZ(29,"ion-label"),n._uU(30),n.ALo(31,"translate"),n.qZA(),n._UZ(32,"ion-icon",4),n.qZA(),n.TgZ(33,"ion-item",3),n.NdJ("click",function(){return o.whatsnew()}),n.TgZ(34,"ion-label"),n._uU(35),n.ALo(36,"translate"),n.qZA(),n._UZ(37,"ion-icon",4),n.qZA()(),n.TgZ(38,"ion-list-header",5),n._uU(39),n.ALo(40,"translate"),n.qZA(),n.TgZ(41,"ion-list")(42,"ion-item",3),n.NdJ("click",function(){return o.wirelesssensorsclick()}),n.TgZ(43,"ion-label"),n._uU(44),n.ALo(45,"translate"),n.qZA(),n._UZ(46,"ion-icon",4),n.qZA(),n.TgZ(47,"ion-item",3),n.NdJ("click",function(){return o.usermanualsclick()}),n.TgZ(48,"ion-label"),n._uU(49),n.ALo(50,"translate"),n.qZA(),n._UZ(51,"ion-icon",4),n.qZA(),n.TgZ(52,"ion-item",3),n.NdJ("click",function(){return o.sourcecodeclick()}),n.TgZ(53,"ion-label"),n._uU(54),n.ALo(55,"translate"),n.qZA(),n._UZ(56,"ion-icon",4),n.qZA()()()),2&t&&(n.Q6J("translucent",!0),n.xp6(3),n.hij(" ",n.lcZ(4,14,"InfoTab.tabname")," "),n.xp6(4),n.hij(" ",n.lcZ(8,16,"InfoTab.informationsection.informationheader")," "),n.xp6(5),n.hij(" ",n.lcZ(13,18,"InfoTab.informationsection.version")," "),n.xp6(3),n.hij(" ",o.version," "),n.xp6(3),n.hij(" ",n.lcZ(19,20,"InfoTab.informationsection.language")," "),n.xp6(3),n.hij(" ",n.lcZ(22,22,"InfoTab.informationsection.selectedlanguage")," "),n.xp6(4),n.hij(" ",n.lcZ(26,24,"InfoTab.informationsection.policy")," "),n.xp6(5),n.hij(" ",n.lcZ(31,26,"InfoTab.informationsection.imprint")," "),n.xp6(5),n.hij(" ",n.lcZ(36,28,"InfoTab.informationsection.whatsnew")," "),n.xp6(4),n.hij(" ",n.lcZ(40,30,"InfoTab.linksection.linksheader")," "),n.xp6(5),n.hij(" ",n.lcZ(45,32,"InfoTab.linksection.wirelessconnectivityandsensors")," "),n.xp6(5),n.hij(" ",n.lcZ(50,34,"InfoTab.linksection.usermanuals")," "),n.xp6(5),n.hij(" ",n.lcZ(55,36,"InfoTab.linksection.sourcecode")," "))},dependencies:[i.W2,i.Gu,i.gu,i.Ie,i.Q$,i.q_,i.yh,i.wd,i.sr,r.X$],styles:["ion-list-header[_ngcontent-%COMP%]{font-size:large;font-weight:700}ion-list[_ngcontent-%COMP%]{padding-top:0!important}"]}),e})()}];let L=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[g.Bz.forChild(y),g.Bz]}),e})();function Z(e){return new A.w(e,"./assets/i18n/",".json")}let k=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[i.Pc,h.ez,u.u5,L,r.aw.forChild({loader:{provide:r.Zw,useFactory:Z,deps:[T.eN]}})]}),e})()}}]);