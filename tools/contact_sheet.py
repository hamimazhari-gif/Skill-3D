import sys,subprocess,os
out=sys.argv[1]; fs=[f for f in sys.argv[2:] if os.path.exists(f)]
cols=min(4,len(fs)); 
# use ffmpeg tile with labels
inputs=[];filt=[]
for i,f in enumerate(fs):
  inputs+=['-i',f]
  lab=os.path.basename(f).split('_')[-1].replace('.png','')
  filt.append(f"[{i}:v]scale=270:480,drawtext=text='{lab}':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v{i}]")
rows=(len(fs)+cols-1)//cols
# pad with blanks
n=len(fs)
for j in range(n,rows*cols):
  filt.append(f"color=c=gray:s=270x480:d=1[v{j}]")
filt.append(''.join(f"[v{j}]" for j in range(rows*cols))+f"xstack=inputs={rows*cols}:layout="+'|'.join(f"{(j%cols)*270}_{(j//cols)*480}" for j in range(rows*cols))+"[o]")
subprocess.run(['ffmpeg','-y','-loglevel','error',*inputs,'-filter_complex',';'.join(filt),'-map','[o]','-frames:v','1',out],check=True)
print(out)
