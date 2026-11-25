"use strict";(self.webpackChunkcqqrs_web=self.webpackChunkcqqrs_web||[]).push([["4317"],{5616(t,e,r){r.r(e),r.d(e,{metadata:()=>s,default:()=>E,frontMatter:()=>j,contentTitle:()=>q,toc:()=>L,assets:()=>k});var s=JSON.parse('{"type":"mdx","permalink":"/publishing/reportGen","source":"@site/src/pages/publishing/reportGen.mdx","title":"Report Generation","frontMatter":{},"unlisted":false}'),o=r(4848),a=r(8453),i=r(1003);class n extends Error{}class l extends Error{}r(3209);class c{year;week;constructor(t){if(t){let e=t.match(/(\d{4}).*(\d{2})/);if(!e||e?.length<3)throw new n(`Invalid edition format: ${t}`);this.year=parseInt(e[1]),this.week=parseInt(e[2])}else{let t=new Date;this.year=t.getUTCFullYear(),this.week=t.getWeekNumber()}}toString(){return`${this.year}/${this.week}`}toNumber(){return this.year+this.week/100}}var d=r(4110),p=r(7444),h=r(780),u=r(9011),g=r(9526),m=r(6540);class b{callsign;qsoList;constructor(t,e){this.callsign=t,this.qsoList=e}sortQsoList(){this.qsoList.sort((t,e)=>e.band-t.band||e.type.toString().localeCompare(t.type.toString())||t.callsign.root.length-e.callsign.root.length)}}class f{_index=new Map;get size(){return this._index.size}constructor(t=[]){t.map(t=>{this._index.set(t.callsign.root,t)})}forEach(t){this._index.forEach(t)}getOrInsert(t,e){return this._index.getOrInsert(t.root,new b(t,e)).qsoList}sortByStationsLogCallsign(){let t=[...this._index.entries()].sort((t,e)=>t[1].callsign.root.localeCompare(e[1].callsign.root));this._index=new Map(t)}filter(t){return new f([...this._index.values()].filter(t))}*[Symbol.iterator](){for(let t of this._index)yield t}}var x=r(4371),y=r(4535);class w{_log;_options;_columnCount=10;constructor(t,e={}){this._log=t,this._options=e}buildHtmlPage(){let t=this.buildHtml();return`<!DOCTYPE html><head><meta charset="UTF-8"></head><body bgcolor="#cccccc">${t}</body>`}buildHtml(){let t=document.createElement("div");t.className="logtable-root",t.innerHTML='<table class="report-table"><tbody id="tbody"></tbody></table>';let e=document.createElement("style");e.textContent=this.getStyle(),t.appendChild(e);let r=[40,80,160,30,20,17,15,12,10,6],s=t.querySelector("tbody");if(!this._options.suppressTitle){let t=this.buildHeaderRow(document);s.appendChild(t)}let o=!1;this._log.forEach(t=>{t.sortQsoList(),this.qsoListToTable(document,s,t.qsoList,t.callsign,r,o),o=!o});let a=t.outerHTML;return(0,x.A)(a,{removeStyleTags:!0})}buildHeaderRow(t){let e=t.createElement("th");e.textContent="Station";let r=t.createElement("th"),s=`
			Who <span class="worked">Worked</span>, 
			<span class="tried">Tried</span> and 
			<span class="heard">Heard</span> each station
			<br />
			on 
			<span class="band-160">\u{2B24}</span>160 
			<span class="band-80">\u{2B24}</span>80
			<span class="band-40">\u{2B24}</span>40
			<span class="band-30">\u{2B24}</span>30
			<span class="band-20">\u{2B24}</span>20
			<span class="band-10">\u{2B24}</span>Other
			?`;r.innerHTML=`${s}`,r.colSpan=this._columnCount-1;let o=t.createElement("tr");return o.appendChild(e),o.appendChild(r),o}qsoListToTable(t,e,r,s,o,a=!1){let i=this._columnCount,n=Math.floor(r.length/i)+1,l=[];for(let r=0;r<n;r++){let o=t.createElement("tr");l.push(o),e.appendChild(o),o.classList+=`${s} ${a?"alt":""}`,o.classList+=`${0===r?" new-station-line":""}`,o.classList+=`${this._options.transparentBackground?" transparent":""}`}if(!this._options.suppressStationCallsign){let e=t.createElement("td");e.textContent=s.toString(),e.rowSpan=n,l[0].appendChild(e)}let c=i*n-n;for(let e=0;e<c;e++){let s,o,a=t.createElement("td");if(s=r[e]){switch(s.type){case y.M.Heard:o="heard";break;case y.M.Tried:o="tried";break;case y.M.Worked:o="worked"}let e=t.createElement("span");e.textContent="\u2B24",e.className=`band-${s.band}`;let r=t.createElement("span");r.className=`${o}`,r.textContent=s.callsign.root,a.className="report",a.title=`${o} on ${s.band} m`,a.appendChild(e),a.appendChild(r)}l[(e%n+n)%n].appendChild(a)}}getStyle(){return`

			.report-table {
				font-family: Verdana, Arial, 'Segoe UI Symbol', sans-serif;
				border-spacing: 0;
				font-size: 0.8em;
			}
			
			.report-table tr {
				background-color: #fdfdfd;

				&.new-station-line td {
					border-top: 5px solid #fff;	
				}

				&.alt {
					background-color: #f8f8f8;
				}
					
				&.transparent {
					background-color: transparent;
					
					td {
						border-top: 5px solid transparent;
					}
				}

			}
			
			.report-table td {
				padding: 3px;
				white-space: nowrap;
				vertical-align: top;
			}

			.report-table th {
				border: 1px solid #eee;
				background-color: #fdfdfd;
				white-space: nowrap;
				font-weight: normal;
			}

			.report-table th .worked {
				font-weight: bold;
				font-size: 1.2em;
			}

			.report-table th .tried {
				font-style: italic;
				font-size: 1.2em;
			}

			.report-table th .heard {
				font-size: 1.2em;
			}
			
			.report-table .worked {
				font-weight: bold;
			}

			.report-table .tried {
				font-style: italic;
			}

			.report-table span.band-160 {
				color: #f2cc8f;
			}
				
			.report-table span.band-80 {
				color: #81b29a;
			}
				
			.report-table span.band-40 {
				color: #3d405b;
			}
				
			.report-table span.band-30 {
				color: #e07a5f;
			}
				
			.report-table span.band-20 {
				color: #fb5607;
			}
				
			.report-table {
				span.band-17, span.band-15, span.band-12, span.band-10, span.band-6,  {
					color: #f4f1de;
				}
			}
		`}}var v=r(9603);class C{_logCol;constructor(t){this._logCol=this.buildReverseLog(t)}toLogCollection(){return this._logCol}buildReverseLog(t){let e=new f;return t.forEach(t=>{t.qsoList.forEach(r=>{let s=e.getOrInsert(r.callsign,[]),o=s.find(e=>e.callsign.root==t.callsign.root&&e.band==r.band);if(o?o.type<r.type&&(o.type=r.type):s.push({band:r.band,callsign:t.callsign,type:r.type}),r.type===y.M.Worked){let s=e.getOrInsert(t.callsign,[]);s.find(t=>t.callsign.root==r.callsign.root&&t.band==r.band)||s.push({band:r.band,callsign:r.callsign,type:r.type})}})}),e}}class S{_reportList;constructor(t){this._reportList=[...t].sort((t,e)=>t.callsign.root.localeCompare(e.callsign.root))}buildHtmlPage(){let t=this.buildHtml();return`<!DOCTYPE html><head><meta charset="UTF-8"></head><body>${t}</body>`}buildHtml(){let t=document.createElement("div");t.id="soapbox-root",t.innerHTML='<table id="soapbox-table"><tbody id="tbody"></tbody></table>';let e=document.createElement("style");e.textContent=this.getStyle(),t.appendChild(e);let r=t.querySelector("tbody");this._reportList.map(t=>{0==t.comments.length&&0==t.photos.length||this.buildReportHtml(t).map(t=>{let e=document.createElement("tr");e.innerHTML=t,r.appendChild(e)})});let s=t.outerHTML;return(0,x.A)(s,{removeStyleTags:!0,applyHeightAttributes:!0,applyWidthAttributes:!0,applyAttributesTableElements:!0})}buildReportHtml(t){let e=[`
			<td class="avitar">
				<img src="${i.c.resourceApiRoot}/avitar/${t.callsign.root}_1.jpg" />
			</td>
			<td class="operator">
				<div class="name">${t.name} ${t.callsign}</div>
				<div class="qth">${t.qth}</div>
			<td>
			`];if(t.qsoList.length>0){let r=new f;r.getOrInsert(t.callsign,t.qsoList);let s=new w(r,{suppressStationCallsign:!0,suppressTitle:!0,transparentBackground:!0}).buildHtml();e.push(`<td colspan="2" class="log">
					<table><tr>
						<td class="log-title">Station Log:</td>
						<td>${s}</td>
					</tr></table>
				</td>`)}if(""!==t.comments){let r=t.comments.replace(/\r?\n/g,"<br>");e.push(`<td colspan="2" class="comment">${r}</td>`)}if(t.photos.length>0){let r=t.photos,s='<td colspan="2" class="photo">';r.map(e=>{let o=`${i.c.reportApiRoot}/${t.edition}/images/`,a=e.filename.replace(".","_400.");s+=`
						<a href="${o}${e.filename}" target="_new">	
							<img src="${o}${a}" class="share-${r.length}"/>
						</a>
				`}),s+='<td colspan="2" class="photo">',e.push(s)}return""!==t.caption&&e.push(`<td colspan="2" class="caption">${t.caption}</td>`),e.push('<td colspan="2" class="foot"><hr /></td>'),e}getStyle(){return`

			#soapbox-root {
				font-size: 16px;
				font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
			}	

			#soapbox-root .name, #soapbox-root .qth {
				padding-left: 15px;
			}
			

			#soapbox-root .name {
				font-weight: bold;
				size: 18px;
			}	
		
			#soapbox-root .qth {
				size: 16px;
				color: #444
			}

			#soapbox-root .avitar {
				width: 60px;
				padding-left: 15px;
			}

			#soapbox-root .avitar img {
				object-fit: cover;
				height: 60px;
				width: 60px;
				border-radius: 50%;
			}

			#soapbox-root .comment {
				line-height: 1.5em;
			}

			#soapbox-root .log,
			#soapbox-root .comment, 
			#soapbox-root .photo {
				padding: 5px 15px 5px 15px;
			}

			#soapbox-root .log .log-title {
				padding-top: 8px;
				vertical-align: top;
			}

			#soapbox-root .photo, #soapbox-root .caption {
				text-align: center;
			}
			
			#soapbox-root .photo img {
				max-height: 300px;
				border-radius: 5px;
			}

			#soapbox-root .photo img.share-2 {
				max-width: 45%;
			}

			#soapbox-root .photo img.share-3 {
				max-width: 30%;
			}

			#soapbox-root .photo img.share-4 {
				max-width: 22%;
			}

			#soapbox-root .caption {
				font-size: 0.9em;
				font-style: italic;
			}

			#soapbox-root .foot {
				padding: 20px 80px 10px 80px;
			}
			
		`}}var $=r(5796);class _{_edition;_extraCs="";addExtraContributors(t){this._extraCs=t}soapbox="Soapbox not yet built.";reverseLog="Reverse log not yet built.";contributors="Contributor list not yet built.";summary="Summary not yet built.";constructor(t){this._edition=new c(t)}async build(){let t=new $.U2,e=[];try{e=await t.reports.getAll(this._edition.year,this._edition.week)}catch(t){if(t instanceof $.j$)if(404==t.status)throw new l("No reports were found for this edition.");else throw Error(`Could not download report.  ${t.message} (${t.status})`);throw Error(`Error downloading report.
${JSON.stringify(t)}`)}let r=new f;e.map(t=>r.getOrInsert(t.callsign,t.qsoList)),this.soapbox=new S(e).buildHtml();let s=new C(r).toLogCollection(),o=await (0,v.Cv)(),a=s.filter(t=>o.has(t.callsign.root));return a.sortByStationsLogCallsign(),this.reverseLog=new w(a).buildHtml(),this.summary=`${r.size} reports were received, showing ${a.size} CQQRS members who worked and heard ${s.size} stations!`,this.contributors=this.getContributors(e),this}getContributors(t){let e=t.map(t=>t.callsign.root);console.log(e.join(", ")),e.push(...this._extraCs.split(/[ ,&]/)),console.log(e.join(", ")),(e=(e=e.filter(t=>t.trim().length>0)).map(t=>t.toUpperCase())).sort(),console.log(e.join(", ")),console.log((e=[...new Set(e)]).join(", "));var r=new Intl.ListFormat("en",{style:"long",type:"conjunction"}).format(e);return console.log(e.join(", ")),`${e.length} Contributors: ${r}`}formatOutputStrings(t){return t.split(/(\d+)/g).map((t,e)=>/^\d+$/.test(t)?(0,o.jsx)("b",{children:t},e):t)}}function T(){let[t,e]=(0,m.useState)("..."),[r,s]=(0,m.useState)("..."),[a,b]=(0,m.useState)(["..."]),[f,x]=(0,m.useState)("..."),[y,w]=(0,m.useState)(""),[v,C]=(0,m.useState)(i.c.ragchewContributingEditors),[S,$]=(0,m.useState)(""),[T,j]=(0,m.useState)(d.p.Idle);(0,m.useEffect)(()=>{w(new c().toString())},[]);let q=async()=>{let t;$("");try{let e=new c(y);(t=new _(e.toString())).addExtraContributors(v),await t.build()}catch(t){j(d.p.Error),t instanceof l?$(t.message):t instanceof l?$("Unable to gerate the reports: "+t.message):t instanceof n?$("Invalid argument: "+t.message):$("Unknown error: "+t);return}e(t.reverseLog),s(t.soapbox),b(t.formatOutputStrings(t.summary)),x(t.contributors),j(d.p.Success)},k={display:"inline",fontWeight:"var(--ifm-font-weight-bold)",margin:"6px",fontSize:"0.9rem",color:"var(--ifm-color-emphasis-700)"},L={width:"100%",padding:"8px 12px",fontSize:"var(--ifm-font-size-base)",fontFamily:"var(--ifm-font-family-base)",backgroundColor:"var(--ifm-background-color)",color:"var(--ifm-font-color-base)",border:"1px solid var(--ifm-color-emphasis-300)",borderRadius:"var(--ifm-global-radius)",outline:"none",boxSizing:"border-box",transition:"border-color var(--ifm-transition-fast)"},A={maxHeight:"20em",overflow:"scroll",margin:"20px"},E={margin:"20px"};return(0,o.jsxs)("div",{className:"markdown",children:[(0,o.jsx)("label",{style:k,children:"Additional contributors"}),(0,o.jsx)("div",{children:(0,o.jsx)("input",{style:L,value:v,onChange:t=>{try{C(t.target.value??"")}catch{}}})}),(0,o.jsxs)("div",{children:[(0,o.jsx)("input",{type:"text",style:{...L,width:"110px"},placeholder:"eg. 2026/44",onChange:t=>{w(t.target.value??"")},value:y.toString()}),(0,o.jsxs)("button",{type:"button",style:{display:"inline-block",padding:"8px 16px",margin:"10px",fontSize:"var(--ifm-font-size-base)",fontFamily:"var(--ifm-font-family-base)",fontWeight:"var(--ifm-font-weight-bold)",backgroundColor:"var(--ifm-color-primary)",color:"#fff",border:"none",borderRadius:"var(--ifm-global-radius)",cursor:"pointer",transition:"background-color var(--ifm-transition-fast), transform 0.1s ease"},onClick:t=>{j(d.p.Submitting);try{q()}catch(t){console.error(t.message)}},disabled:T===d.p.Submitting,children:[T===d.p.Idle&&"Submit",T===d.p.Submitting&&"Submitting\u2026",T===d.p.Success&&"Done!",T===d.p.Error&&"Oh oh!"]})]}),S.length>1&&(0,o.jsx)(p.A,{type:"warning",title:"Whoops!",children:(0,o.jsx)("p",{children:S})}),(0,o.jsx)("hr",{}),(0,o.jsx)("label",{style:k,children:"Summery"}),(0,o.jsx)("div",{style:E,children:a}),(0,o.jsx)("label",{style:k,children:"Contributors"}),(0,o.jsx)("div",{style:E,children:f}),(0,o.jsx)("div",{style:A,children:(0,o.jsx)(g.A,{children:()=>(0,o.jsx)(u.A,{language:"text",title:"Table",showLineNumbers:!0,children:t})})}),(0,o.jsx)("div",{style:A,children:(0,o.jsx)(g.A,{children:()=>(0,o.jsx)(u.A,{language:"text",title:"Soapbox",showLineNumbers:!0,children:r})})}),(0,o.jsx)("hr",{}),(0,o.jsx)("h2",{children:"Preview: Reverse Log"}),(0,o.jsx)(h.Ay.div,{className:"quote",children:(0,o.jsx)("div",{dangerouslySetInnerHTML:{__html:t}})}),(0,o.jsx)("h2",{children:"Preview: Soapbox"}),(0,o.jsx)(h.Ay.div,{className:"quote",children:(0,o.jsx)("div",{dangerouslySetInnerHTML:{__html:r}})})]})}let j={},q="Report Generation",k={},L=[];function A(t){let e={h1:"h1",header:"header",...(0,a.R)(),...t.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(e.header,{children:(0,o.jsx)(e.h1,{id:"report-generation",children:"Report Generation"})}),"\n",(0,o.jsx)(T,{})]})}function E(t={}){let{wrapper:e}={...(0,a.R)(),...t.components};return e?(0,o.jsx)(e,{...t,children:(0,o.jsx)(A,{...t})}):A(t)}},1003(t,e,r){r.d(e,{c:()=>s});let s={cqqApiRoot:"https://conryclan.com/projects/cqqrsnet/api/v1",reportApi:"https://conryclan.com/projects/cqqrsnet/api/report.php",reportApiRoot:"https://conryclan.com/projects/cqqrsnet/reports",resourceApiRoot:"https://conryclan.com/projects/cqqrsnet/resource",reportSavePath:"/data/reports",memberDirectoryPath:"/data/directory.json",ragchewContributingEditors:"VK6HRC VK3ACU",mailchimp:{templateId:0x996fbb,audienceId:"8640b3cd58"}}},5796(t,e,r){r.d(e,{j$:()=>c,U2:()=>l});class s{callsign;_root="";_prefix="";_suffix="";get root(){return this._root}get prefix(){return this._prefix}get suffix(){return this._suffix}constructor(t){if(this.callsign=t,""==t)return;t=t.trim();try{this.extractParts(t)}catch(e){this._root=t}}toString(){let t="";return this._prefix.length>0&&(t+=`${this._prefix}/`),t+=this.root,this._suffix.length>0&&(t+=`/${this._suffix}`),t}extractParts(t){let e=t.toUpperCase(),r=/^(?:([A-Z0-9]{1,3})\/)?([A-Z0-9]{4,})(?:\/([A-Z0-9]{1,3}))?$/.exec(e);if(!r||r.length<4)throw`Invalid callsign: ${t}`;this._prefix=r[1]??"",this._root=r[2].trim(),this._suffix=r[3]??""}}var o=r(4535);class a{name;qth;grid;comments;caption;submittedAt;edition;photos;qsoList;callsign;constructor(t,e,r,o,a,i,n,l,c,d){this.name=t,this.qth=r,this.grid=o,this.comments=a,this.caption=i,this.submittedAt=n,this.edition=l,this.photos=c,this.qsoList=d,this.callsign=new s(e)}addQSO(t){this.qsoList.push(t)}}class i{report;constructor(t){let e=this.buildQsoList(t);this.report=new a(t.name,t.callsign,t.qth,t.grid,t.comments,t.caption,t.submitted_at,t.edition,t.photos,e)}buildQsoList(t){return[...this.extractQSOs(t.worked40,40,o.M.Worked),...this.extractQSOs(t.worked80,80,o.M.Worked),...this.extractQSOs(t.workedOther,40,o.M.Worked),...this.extractQSOs(t.heard40,40,o.M.Heard),...this.extractQSOs(t.heard80,80,o.M.Heard),...this.extractQSOs(t.heardOther,40,o.M.Heard),...this.extractQSOs(t.tried40,40,o.M.Tried),...this.extractQSOs(t.tried80,80,o.M.Tried),...this.extractQSOs(t.triedOther,40,o.M.Tried)]}extractQSOs(t,e,r){return this.extractBandAndCallsigns(t,e).map(t=>({band:t.band,callsign:new s(t.callsign),type:r}))}extractBandAndCallsigns(t,e){let r=[];return(t=t.replaceAll(/[\s,.]/g,"|")).split(/\|+/g).filter(t=>t.length>0).map(t=>{let[s,o]=this.splitBandFromCallsign(t);o=o>0?o:e,r.push({band:o,callsign:s})}),r}splitBandFromCallsign(t){let e=t.match(/(?:.{1,3}\/)?([^@\/]*)[^@]*(?:@[^\d]*(\d+))?/),r=e?.[1]??"",s=e?.[2]??"0";return[r.toUpperCase(),parseInt(s)]}}var n=r(9603);class l{baseUrl;apiVersion;timeout;reports;members;constructor(t={}){this.baseUrl=t.baseUrl||"https://conryclan.com/projects/cqqrsnet/api",this.apiVersion=t.apiVersion||"v1",this.timeout=t.timeout||3e4,this.reports=new d(this),this.members=new p(this)}async request(t,e,r={}){let s=`${this.baseUrl}/${this.apiVersion}${e}`,{data:o,...a}=r,i=new AbortController,n=setTimeout(()=>i.abort(),this.timeout);try{let e,n=await fetch(s,{cache:"no-cache",method:t,signal:i.signal,headers:{"Content-Type":"application/json",...r.headers},body:o?JSON.stringify(o):void 0,...a}),l={};if(n.headers.forEach((t,e)=>{l[e]=t}),e=204===n.status?null:n.headers.get("content-type")?.includes("application/json")?await n.json():await n.text(),!n.ok)throw new c(n.status,"object"==typeof e&&null!==e&&"error"in e?e.error:`HTTP ${n.status}`,e);return{status:n.status,data:e,headers:l}}finally{clearTimeout(n)}}}class c extends Error{status;responseData;constructor(t,e,r){super("string"==typeof e?e:JSON.stringify(e)),this.status=t,this.responseData=r,this.name="HttpError"}}class d{client;constructor(t){this.client=t}async getAll(t,e){let{data:r}=await this.client.request("GET",`/reports/${t}/${e}`);return r.map(t=>new i(t).report)}async getByCallsign(t,e,r){let{data:s}=await this.client.request("GET",`/reports/${t}/${e}/${encodeURIComponent(r)}`);return new i(s).report}async getImage(t,e,r){let s=`${this.client.baseUrl}/${this.client.apiVersion}/reports/${t}/${e}/images/${encodeURIComponent(r)}`,o=new AbortController,a=setTimeout(()=>o.abort(),this.client.timeout);try{let t=await fetch(s,{signal:o.signal});if(!t.ok)throw new c(t.status,`HTTP ${t.status}`);return await t.blob()}finally{clearTimeout(a)}}}class p{client;constructor(t){this.client=t}async getAll(){let{data:t}=await this.client.request("GET","/members/");return t.map(t=>new n.vZ(t.callsign,t.name,t.qth,t.grid,t.reported,t.lastActive))}async get(t){let{data:e}=await this.client.request("GET",`/members/${encodeURIComponent(t)}`);return e}async getAvatar(t){let e=`${this.client.baseUrl}/${this.client.apiVersion}/members/${encodeURIComponent(t)}/avitar`,r=new AbortController,s=setTimeout(()=>r.abort(),this.client.timeout);try{let t=await fetch(e,{signal:r.signal});if(!t.ok)throw new c(t.status,`HTTP ${t.status}`);return await t.blob()}finally{clearTimeout(s)}}async uploadAvatar(t,e){let r=new FormData;r.append("file",e);let s=`${this.client.baseUrl}/${this.client.apiVersion}/members/${encodeURIComponent(t)}/avitar`,o=new AbortController,a=setTimeout(()=>o.abort(),this.client.timeout);try{let t=await fetch(s,{method:"POST",signal:o.signal,body:r}),e=await t.json();if(!t.ok)throw new c(t.status,"object"==typeof e&&null!==e&&"error"in e?e.error:`HTTP ${t.status}`,e);return e}finally{clearTimeout(a)}}async upsert(t){let{data:e}=await this.client.request("POST","/members/",{data:t});return e}}},3209(){Date.prototype.getWeekNumber=function(){let t=new Date(Date.UTC(this.getFullYear(),this.getMonth(),this.getDate()));var e=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-e);let r=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t.getTime()-r.getTime())/864e5+1)/7)}},9603(t,e,r){r.d(e,{Cv:()=>i,vZ:()=>a});var s=r(5796);class o{_directory=new Map;has(t){return this._directory.has(t)}toArray(){return[...this._directory]}add(t,e){return this._directory.set(t,e)}get(t){return this._directory.get(t)}getOrInsert(t,e){return this._directory.getOrInsert(t,e)}set(t,e){return this._directory.set(t,e)}members(){return[...this._directory.values()]}}class a{callsign;name;qth;grid;reported;lastActive;constructor(t,e,r,s,o,a){this.callsign=t,this.name=e,this.qth=r,this.grid=s,this.reported=o,this.lastActive=new Date(a)}}async function i(){try{let t=new s.U2,e=await t.members.getAll(),r=new o;return e.map(t=>{r.add(t.callsign,t)}),r}catch(t){throw Error("Could not retrieve member directory")}}},4535(t,e,r){r.d(e,{M:()=>o});var s,o=((s={})[s.Heard=0]="Heard",s[s.Tried=1]="Tried",s[s.Worked=2]="Worked",s)},4110(t,e,r){r.d(e,{p:()=>o});var s,o=((s={})[s.Idle=0]="Idle",s[s.Submitting=1]="Submitting",s[s.Success=2]="Success",s[s.Error=3]="Error",s)},4320(){},3038(){},1190(){},7155(){},4318(){}}]);