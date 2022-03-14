;const FSbounded = (FS,compare,seq,low)=>{
   var res,n=0
   while(true){
      res = FS(seq,n)
      if(compare(res,low[0])>0) return res
      n++
   }
}
,app = Vue.createApp({
   data:()=>({
      current_tab:0
      ,FS_shown:register.map(()=>3)
      ,datasets:register.map(notation=>notation.init())
   })
   ,computed:{
      current_notation(){return register[this.current_tab].id}
      ,tab_names:()=>register.map(notation=>notation.name)
   }
   ,methods:{
      incrFS(tab_index){
         this.FS_shown.splice(tab_index,1,this.FS_shown[tab_index]+1)
      }
      ,decrFS(tab_index){
         this.FS_shown.splice(tab_index,1,Math.max(this.FS_shown[tab_index]-1,0))
      }
   }
})
register.forEach((notation,index)=>{
   app.component(notation.id+'-list',{
      props:['expr','low','subitems']
      ,data:()=>({
         display:notation.display
         ,able:notation.able
         ,compare:notation.compare
         ,FS:notation.FS
         ,shownFS:[]
      })
      ,methods:{
         recalculate(){
            if(!this.able(this.expr)) return;
            var res=[]
            ,nmax=this.$root.FS_shown[index]
            for(var n=0;n<=nmax;++n) res.push(n+':&nbsp;'+this.display(this.FS(this.expr,n)))
            this.shownFS = res
         }
         ,expand(){
            if(!this.able(this.expr)) return;
            var working_expr = FSbounded(this.FS,this.compare,this.expr,this.low)
            var newsub=[]
            ,newlow = working_expr
            this.subitems.unshift({
               expr:JSON.parse(JSON.stringify(working_expr))
               ,low:JSON.parse(JSON.stringify(this.low))
               ,subitems:newsub
            })
            while(this.able(working_expr)){
               working_expr = FSbounded(this.FS,this.compare,working_expr,this.low)
               newsub.push({
                  expr:JSON.parse(JSON.stringify(working_expr))
                  ,low:JSON.parse(JSON.stringify(this.low))
                  ,subitems:[]
               })
            }
            for(var i=newsub.length;i--;){
               if(i>0) newsub[i-1].low = [JSON.parse(JSON.stringify(newsub[i].expr))]
               else this.subitems[0].low = [JSON.parse(JSON.stringify(newsub[0].expr))]
            }
            this.low[0] = newlow
         }
      }
      ,template:`<li><span class="shown-item" @mouseover="recalculate()" @mousedown="expand()"><span v-html="display(expr)"></span><span class="tooltip" v-if="able(expr)">
            <span v-html="display(expr)"></span> fundamental sequence:
            <span v-for="term in shownFS"><br><span v-html="term"></span></span>
         </span></span>
         <ul>
            <`+notation.id+`-list v-for="subitem in subitems" v-bind="subitem"></`+notation.id+`-list>
         </ul>
      </li>`
   })
   app.component(notation.id,{
      props:['dataset']
      ,template:`<ul><`+notation.id+`-list v-for="item in dataset" v-bind="item"></`+notation.id+`-list></ul>`
   })
})
app.mount('#app')