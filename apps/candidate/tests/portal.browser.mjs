import { createRequire } from "node:module"
import assert from "node:assert/strict"
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright")
const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})})
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}})
 const errors=[];page.on("pageerror",e=>errors.push(e.message))
 const candidate="11111111-1111-1111-1111-111111111111", session="22222222-2222-2222-2222-222222222222"
 const data={candidateId:candidate,candidateName:"Alya Putri",candidateEmail:"alya@example.test",applications:[{id:"a",batchName:"Software Engineer Development Program",codeApplication:"APP-2026-0142",departmentName:"Application Development",status:"InProcess",pipeline:[{batchStageId:"b1",stageName:"Technical assessment"},{batchStageId:"b2",stageName:"Technical interview"},{batchStageId:"b3",stageName:"Final interview"}],stages:[{applicationStageId:"st1",batchStageId:"b1",stageName:"Technical assessment",status:"Prioritized",endAt:"2027-01-01T00:00:00Z",canTakeTest:false,sessions:[]},{applicationStageId:"st2",batchStageId:"b2",stageName:"Technical interview",status:"InProgress",endAt:"2027-01-10T00:00:00Z",canTakeTest:false,sessions:[{id:session,sessionName:"Technical interview",scheduledStart:"2027-01-09T03:00:00Z",scheduledEnd:"2027-01-09T04:00:00Z",status:"AcceptedByInterviewer",isOnline:true,meetingUrl:"https://meet.google.com/example",endedSubmissionAt:"2027-01-08T16:59:00Z",canConfirm:true,canRequestReschedule:true,canUploadSubmission:true,isSubmitted:false,interviewers:["Budi Santoso"]}]}]}]}
 const calls=[]
 await page.route("**/api/portal/**",async route=>{
  const req=route.request();calls.push(req.url())
  if(req.method()==="POST") {
   const body=req.postDataJSON(); const s=data.applications[0].stages[1].sessions[0]
   if(req.url().endsWith("/submission")){assert.equal(body.fileSubmission,"https://drive.google.com/file/d/example/view");s.fileSubmission=body.fileSubmission;s.isSubmitted=true}
   if(req.url().endsWith("/confirm")){s.canConfirm=false;s.status="AcceptedByCandidate"}
   if(req.url().endsWith("/reschedule")){s.canRequestReschedule=false;s.reschedule={status:"Pending",proposedStart:body.proposedStart,proposedEnd:body.proposedEnd}}
   return route.fulfill({json:{}})
  }
  return route.fulfill({json:data})
 })
 const base=process.env.PORTAL_URL || "http://127.0.0.1:5175"
 await page.goto(`${base}/portal/${candidate}`)
 await page.getByRole("heading",{name:"Halo, Alya."}).waitFor()
 await page.getByText("Final interview",{exact:true}).waitFor()
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+"/candidate-desktop.png",fullPage:true})
 await page.setViewportSize({width:390,height:844})
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"Dashboard mobile must not overflow")
 await page.getByRole("button",{name:"Buka navigasi"}).click()
 await page.getByRole("dialog").getByRole("link",{name:"Tugas take-home"}).click()
 await page.getByRole("heading",{name:"Tugas take-home",exact:true}).waitFor()
 assert.equal(new URL(page.url()).pathname,`/portal/${candidate}/assignments`)
 await page.getByRole("link",{name:"Detail pengumpulan",exact:true}).waitFor()
 assert.equal(await page.getByRole("dialog").isVisible(),false)
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"Assignments mobile must not overflow")
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+"/candidate-dashboard-mobile.png",fullPage:true})
 await page.setViewportSize({width:1440,height:1000})
 await page.getByRole("link",{name:"Jadwal interview",exact:true}).click()
 await page.getByRole("heading",{name:"Jadwal interview",exact:true}).waitFor()
 assert.equal(new URL(page.url()).pathname,`/portal/${candidate}/interviews`)
 await page.reload()
 await page.getByRole("heading",{name:"Jadwal interview",exact:true}).waitFor()
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+"/candidate-interviews.png",fullPage:true})
 await page.getByRole("link",{name:"Tinjau jadwal"}).click()
 await page.getByRole("button",{name:"Konfirmasi hadir"}).click()
 await page.getByText("Kehadiran Anda berhasil dikonfirmasi.").waitFor()
 await page.getByLabel("Tautan Google Drive").fill("https://drive.google.com/file/d/example/view")
 await page.getByRole("button",{name:"Kirim tugas",exact:true}).click()
 await page.getByRole("link",{name:"Lihat tugas terkirim"}).waitFor()
 await page.getByRole("button",{name:"Ajukan reschedule"}).click()
 await page.getByLabel("Mulai",{exact:true}).fill("2027-01-11T10:00")
 await page.getByLabel("Selesai",{exact:true}).fill("2027-01-11T11:00")
 await page.getByLabel("Alasan",{exact:true}).fill("Ada jadwal yang bertepatan.")
 await page.getByRole("button",{name:"Kirim usulan"}).click()
 await page.getByText("Reschedule: Menunggu keputusan HR").waitFor()
 await page.setViewportSize({width:390,height:844})
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"Mobile must not overflow")
 if(process.env.SCREENSHOT_DIR) await page.screenshot({path:process.env.SCREENSHOT_DIR+"/candidate-mobile.png",fullPage:true})
 assert.equal(calls.some(url=>url.includes("/test")),false,"No exam API calls")
 data.applications[0].stages[1].sessions=[]
 await page.goto(`${base}/portal/${candidate}/interviews`)
 await page.getByRole("heading",{name:"Belum ada jadwal interview"}).waitFor()
 await page.goto(`${base}/portal/${candidate}/assignments`)
 await page.getByRole("heading",{name:"Belum ada tugas take-home"}).waitFor()
 await page.goto(base)
 await page.getByRole("heading",{name:"Buka tautan undangan Anda"}).waitFor()
 assert.deepEqual(errors,[])
 console.log("Browser checks passed: overview, confirmation, submission, reschedule, mobile, invalid link; no exam calls.")
} finally {await browser.close()}
