const {chromium}=require('playwright');const fs=require('fs');
const S=require('path').resolve(process.env.SOPHIA_DIR||'.');
const files={sop:S+'/SOP_Editor_V76_SOPHIA_Light.html',qc:S+'/Quick_Card_Editor_V76_SOPHIA_Light.html'};
const WORD_HTML=`<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><style>p.MsoNormal{margin:0}</style></head><body><!--StartFragment-->
<h1 style="mso-style:x">Pasted section</h1><p class=MsoNormal style="color:red;font-family:Calibri">Intro with <b>bold</b>, <i>italic</i> and <a href="https://example.com/x">a link</a> and <a href="javascript:alert(1)">bad link</a><o:p></o:p></p>
<p class=MsoListParagraphCxSpFirst style='mso-list:l0 level1 lfo1'><span style='mso-list:Ignore'>·<span>&nbsp;</span></span>First bullet</p>
<p class=MsoListParagraphCxSpLast style='mso-list:l0 level1 lfo1'><span style='mso-list:Ignore'>·<span>&nbsp;</span></span>Second bullet</p>
<p class=MsoNormal>&nbsp;</p><table class=MsoTableGrid border=1><tr><td style="width:100pt">A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></table>
<img src="file:///C:/x.png"><script>window.__pwned=1</script><!--EndFragment--></body></html>`;
let failures=0;const R=[];const rec=(prof,name,ok,detail='')=>{R.push(`${ok?'PASS':'FAIL'} ${prof} ${name}${detail?' — '+detail:''}`);if(!ok)failures++;};
(async()=>{const b=await chromium.launch();
for(const [prof,file] of Object.entries(files)){
 const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+file);await p.waitForTimeout(700);
 // read mode: no bar on selection, context menu native (not ours)
 await p.locator('#document .pagecontent p').first().dblclick();await p.waitForTimeout(400);
 rec(prof,'read: mini-bar hidden',await p.evaluate(()=>document.querySelector('.sv76-selbar').hidden));
 await p.locator('#document .pagecontent p').first().click({button:'right'});await p.waitForTimeout(200);
 rec(prof,'read: own context menu not shown',await p.evaluate(()=>!document.querySelector('.sv76-menu')));
 await p.keyboard.press('Escape');
 rec(prof,'read: spellcheck off',await p.evaluate(()=>document.getElementById('document').spellcheck===false));
 // F1 help in read mode
 await p.keyboard.press('F1');await p.waitForTimeout(200);
 rec(prof,'F1 opens shortcuts help',await p.evaluate(()=>!!document.querySelector('dialog.sv76-dialog[open]')));
 await p.keyboard.press('Escape');await p.waitForTimeout(150);
 rec(prof,'Esc closes help',await p.evaluate(()=>!document.querySelector('dialog.sv76-dialog')));
 // Ctrl+F find
 await p.keyboard.press('Control+f');await p.waitForTimeout(200);
 rec(prof,'Ctrl+F opens Find in document',await p.evaluate(()=>!!document.querySelector('dialog.document-navigator-v19[open]')));
 await p.keyboard.press('Escape');await p.waitForTimeout(150);
 // start editing
 const pid=await p.evaluate(()=>Object.keys(localPIDKeys)[0]);const key=await p.evaluate(k=>localPIDKeys[k],pid);
 await p.evaluate(()=>document.querySelector('[data-command-v24=edit]').click());await p.waitForTimeout(150);
 await p.fill('#pidInput',pid);await p.fill('#pidKey',key);await p.click('dialog.modalveil .primary');await p.waitForTimeout(300);
 rec(prof,'edit: spellcheck on',await p.evaluate(()=>document.getElementById('document').spellcheck===true));
 // W-01 mini-bar + bold + undo
 const para=p.locator('#document .pagecontent p').first();
 await para.dblclick({position:{x:40,y:8}});await p.waitForTimeout(400);
 const word=await p.evaluate(()=>getSelection().toString().trim());
 const barShown=await p.evaluate(()=>{const b=document.querySelector('.sv76-selbar');return !b.hidden&&b.getBoundingClientRect().width>100});
 rec(prof,'edit: mini-bar appears on selection',barShown,'word='+word);
 await p.click('.sv76-selbar .sv76-b');await p.waitForTimeout(300);
 const bolded=await p.evaluate(w=>[...document.querySelectorAll('#document .pagecontent p b,#document .pagecontent p strong')].some(n=>n.textContent.trim()===w),word);
 rec(prof,'mini-bar Bold applies',bolded);
 await p.keyboard.press('Control+z');await p.waitForTimeout(400);
 rec(prof,'Ctrl+Z undoes bold',await p.evaluate(w=>![...document.querySelectorAll('#document .pagecontent p b,#document .pagecontent p strong')].some(n=>n.textContent.trim()===w),word));
 // W-02 context menu on text
 await para.click({position:{x:60,y:8}});await para.click({position:{x:60,y:8},button:'right'});await p.waitForTimeout(200);
 const menu=await p.evaluate(()=>[...document.querySelectorAll('.sv76-menu [role=menuitem]')].map(b=>b.firstChild.textContent));
 rec(prof,'context menu on text',menu.includes('Insert block below…')&&menu.includes('Heading 1'),menu.length+' items');
 // Insert block below -> slash menu -> Heading 1 via filter
 await p.click('.sv76-menu [role=menuitem]:has-text("Insert block below")');await p.waitForTimeout(300);
 const slashOpen=await p.evaluate(()=>!!document.querySelector('.sv76-menu input[type=search]'));
 rec(prof,'"Insert block below" opens / menu',slashOpen);
 await p.keyboard.type('heading 1');await p.keyboard.press('Enter');await p.waitForTimeout(300);
 await p.keyboard.type('New heading from slash');await p.waitForTimeout(200);
 rec(prof,'/ menu → Heading 1 creates h2',await p.evaluate(()=>[...document.querySelectorAll('#document .pagecontent h2')].some(h=>h.textContent.includes('New heading from slash'))));
 // slash key in empty paragraph
 await p.keyboard.press('Enter');await p.waitForTimeout(150);await p.keyboard.press('/');await p.waitForTimeout(250);
 const slashKey=await p.evaluate(()=>!!document.querySelector('.sv76-menu input[type=search]'));
 rec(prof,'"/" in empty paragraph opens menu',slashKey);
 await p.keyboard.type('warning');await p.keyboard.press('Enter');await p.waitForTimeout(300);await p.keyboard.type('Check the template version.');
 rec(prof,'/ menu → Warning callout',await p.evaluate(()=>[...document.querySelectorAll('#document aside.warning')].some(a=>a.textContent.includes('Warning: Check the template version.')||a.textContent.includes('Warning:\u00a0Check'))));
 // '/' inside text should type normally
 await p.keyboard.type(' a/b');await p.waitForTimeout(150);
 rec(prof,'"/" inside text types normally',await p.evaluate(()=>!document.querySelector('.sv76-menu')&&[...document.querySelectorAll('#document aside.warning')].some(a=>a.textContent.includes('a/b'))));
 // W-04 shortcuts: Ctrl+Alt+2 heading, AltGr guard, Ctrl+Shift+8 list
 await para.click({position:{x:60,y:8}});
 await p.keyboard.press('Control+Alt+2');await p.waitForTimeout(250);
 const h3=await p.evaluate(()=>{const s=getSelection();return s.anchorNode&&(s.anchorNode.nodeType===1?s.anchorNode:s.anchorNode.parentElement).closest('h3')?.tagName||''});
 rec(prof,'Ctrl+Alt+2 → Heading 2 (h3)',h3==='H3');
 await p.keyboard.press('Control+z');await p.waitForTimeout(300);
 const before=await p.evaluate(()=>document.querySelector('#document .pagecontent').innerHTML.length);
 await p.evaluate(()=>{const ev=new KeyboardEvent('keydown',{key:'@',code:'Digit2',ctrlKey:true,altKey:true,bubbles:true,cancelable:true});document.activeElement.dispatchEvent(ev);});
 rec(prof,'AltGr+2 (@) does not change block',await p.evaluate(b=>document.querySelector('#document .pagecontent').innerHTML.length===b,before));
 await p.keyboard.press('Control+Shift+8');await p.waitForTimeout(250);
 rec(prof,'Ctrl+Shift+8 → bulleted list',await p.evaluate(()=>{const s=getSelection();return !!(s.anchorNode.nodeType===1?s.anchorNode:s.anchorNode.parentElement).closest('ul')}));
 await p.keyboard.press('Control+z');await p.waitForTimeout(300);
 // W-06 paste from Word
 await para.click({position:{x:60,y:8}});await p.keyboard.press('End');
 await p.evaluate(html=>{const dt=new DataTransfer();dt.setData('text/html',html);dt.setData('text/plain','Pasted section Intro');const ev=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});document.activeElement.dispatchEvent(ev);},WORD_HTML);
 await p.waitForTimeout(300);
 const pasted=await p.evaluate(()=>{const pc=document.querySelector('#document .pagecontent');const h=[...pc.querySelectorAll('h2')].find(n=>n.textContent==='Pasted section');const ul=[...pc.querySelectorAll('ul')].find(u=>u.textContent.includes('First bullet'));const t=[...pc.querySelectorAll('table')].find(t=>t.textContent.includes('A1'));const intro=[...pc.querySelectorAll('p')].find(n=>n.textContent.startsWith('Intro with'));
  return {h:!!h,ul:ul?ul.children.length:0,bulletClean:ul?!ul.textContent.includes('·'):false,table:!!t,tbody:t?!!t.tBodies.length:false,bold:!!intro?.querySelector('b'),link:intro?.querySelector('a')?.getAttribute('href'),badLink:!!intro&&[...intro.querySelectorAll('a')].length,styles:pc.querySelectorAll('[style*="mso"],[class^="Mso"],[style*="font-family:Calibri"]').length,script:window.__pwned===1,op:pc.innerHTML.includes('o:p')}});
 rec(prof,'Word paste keeps structure',pasted.h&&pasted.ul===2&&pasted.bulletClean&&pasted.table&&pasted.tbody&&pasted.bold&&pasted.link==='https://example.com/x',JSON.stringify(pasted));
 rec(prof,'Word paste is sanitized (no mso, no javascript:, no script)',pasted.styles===0&&pasted.badLink===1&&!pasted.script&&!pasted.op);
 await p.keyboard.press('Control+z');await p.waitForTimeout(400);
 rec(prof,'Ctrl+Z undoes whole paste',await p.evaluate(()=>![...document.querySelectorAll('#document h2')].some(n=>n.textContent==='Pasted section')));
 // Ctrl+Shift+V plain
 await p.evaluate(()=>document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'V',code:'KeyV',ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true})));
 await p.evaluate(html=>{const dt=new DataTransfer();dt.setData('text/html',html);dt.setData('text/plain','PLAINPASTE');const ev=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});document.activeElement.dispatchEvent(ev);},WORD_HTML);
 await p.waitForTimeout(300);
 rec(prof,'Ctrl+Shift+V pastes plain text',await p.evaluate(()=>document.querySelector('#document').textContent.includes('PLAINPASTE')&&![...document.querySelectorAll('#document h2')].some(n=>n.textContent==='Pasted section')));
 // W-02 table context menu
 const cell=p.locator('#document .pagecontent table:not(.identity) td').first();
 if(await cell.count()){await cell.click();await cell.click({button:'right'});await p.waitForTimeout(200);
  const tmenu=await p.evaluate(()=>[...document.querySelectorAll('.sv76-menu [role=menuitem]')].map(b=>b.firstChild.textContent));
  rec(prof,'context menu on table cell',tmenu.includes('Insert row below')&&tmenu.includes('Table Studio…')&&(prof!=='qc'||tmenu.includes('Table Flow…')),tmenu.filter(x=>/row|column|Table/.test(x)).join(', '));
  await p.click('.sv76-menu [role=menuitem]:has-text("Insert row below")');await p.waitForTimeout(400);
  rec(prof,'"Insert row below" opens Table Studio with staged op',await p.evaluate(()=>!!document.querySelector('dialog.table-studio-v26[open]')&&document.querySelector('.table-studio-v26 [data-operations]').children.length>0));
  await p.evaluate(()=>{const d=document.querySelector('dialog.table-studio-v26');d?.querySelector('[data-close]')?.click();d?.querySelector('[data-discard]')?.click();});await p.waitForTimeout(200);
 }
 // W-02 image context menu (insert test image through a transaction)
 await p.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=80;c.getContext('2d').fillRect(0,0,200,80);EditorTransactions.run('test image',()=>{const f=document.createElement('figure');const im=document.createElement('img');im.src=c.toDataURL();im.alt='Test image';f.append(im);document.querySelector('#document .pagecontent').prepend(f);});});
 await p.waitForTimeout(300);
 await p.locator('#document .pagecontent img[alt="Test image"]').click({button:'right'});await p.waitForTimeout(200);
 const imenu=await p.evaluate(()=>[...document.querySelectorAll('.sv76-menu [role=menuitem]')].map(b=>b.firstChild.textContent));
 rec(prof,'context menu on image',imenu.includes('Move down')&&imenu.includes('Delete image'),imenu.join(', '));
 await p.click('.sv76-menu [role=menuitem]:has-text("Move down")');await p.waitForTimeout(400);
 rec(prof,'image "Move down" moves the figure',await p.evaluate(()=>{const f=document.querySelector('#document img[alt="Test image"]').closest('figure');return f.previousElementSibling!==null}));
 // W-12 changes panel
 await p.evaluate(()=>side('versions'));await p.waitForTimeout(1700);
 const ch=await p.evaluate(()=>({card:!!document.querySelector('#sideContent .sv76-changes'),items:[...document.querySelectorAll('#sideContent .sv76-chg b')].map(n=>n.textContent),hl:['sophia-added','sophia-modified','sophia-moved'].map(k=>CSS.highlights.get(k)?.size||0)}));
 rec(prof,'Changes card lists unsaved changes',ch.card&&ch.items.length>0,JSON.stringify(ch));
 rec(prof,'Changes highlighted without touching DOM',ch.hl.some(n=>n>0)&&await p.evaluate(()=>!document.querySelector('#document [class*="sophia-"],#document [data-sophia-chg]')));
 // revert a modified block: type into a fresh paragraph of original text
 const target=p.locator('#document .pagecontent p').nth(2);const orig=await target.textContent();
 await target.click();await p.keyboard.press('End');await p.keyboard.type(' REVERTME');await p.waitForTimeout(1700);
 await p.evaluate(()=>side('versions'));await p.waitForTimeout(400);
 const reverted=await p.evaluate(async()=>{const li=[...document.querySelectorAll('#sideContent .sv76-chg')].find(l=>l.textContent.includes('REVERTME'));if(!li)return 'no item';const btn=[...li.querySelectorAll('button')].find(b=>b.textContent==='Revert');if(!btn)return 'no revert button';btn.click();await new Promise(r=>setTimeout(r,300));return !document.querySelector('#document').textContent.includes('REVERTME')});
 rec(prof,'Revert restores block from last saved revision',reverted===true,String(reverted));
 // export & reopen: no runtime leftovers
 await p.evaluate(()=>exportPID('Draft'));await p.fill('#v2reason','v76 test');await p.check('#v2confirm');await p.click('dialog.modalveil .primary');await p.waitForTimeout(300);
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('dialog.save-receipt [data-download]')]);const out=require('os').tmpdir()+'/'+prof+'_v76_saved.html';await dl.saveAs(out);
 const saved=fs.readFileSync(out,'utf8');
 rec(prof,'exported file has no V76 runtime surfaces',!/class="sv76-(selbar|menu|dialog|changes)/.test(saved)&&!/sophia-(added|modified)"/.test(saved.replace(/<style[\s\S]*?<\/style>/g,'').replace(/<script[\s\S]*?<\/script>/g,'')));
 const p2=await ctx.newPage();const e2=[];p2.on('pageerror',e=>e2.push(e.message));await p2.goto('file://'+out);await p2.waitForTimeout(700);
 rec(prof,'reopened copy: one bar, no menus, no errors',await p2.evaluate(()=>document.querySelectorAll('.sv76-selbar').length===1&&!document.querySelector('.sv76-menu'))&&!e2.length,e2.join('|'));
 rec(prof,'Commands palette lists new commands',await p.evaluate(()=>{const l=Workbench.list().map(c=>c.id);return ['shortcuts','changes','symbols'].every(x=>l.includes(x))}));
 rec(prof,'no console/page errors during session',!errs.length,errs.slice(0,3).join(' | '));
 await ctx.close();
}
await b.close();console.log(R.join('\n'));console.log('FAILURES',failures);})();
