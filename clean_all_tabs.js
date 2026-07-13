const fs = require('fs');

const files = [
  { path: 'products/page.tsx', tab: 'products', nextTab: 'blogs' },
  { path: 'blogs/page.tsx', tab: 'blogs', nextTab: 'faqs' },
  { path: 'faqs/page.tsx', tab: 'faqs', nextTab: 'categories' },
  { path: 'categories/page.tsx', tab: 'categories', nextTab: 'help' },
  { path: 'help/page.tsx', tab: 'help', nextTab: 'jobs' },
  { path: 'careers/page.tsx', tab: 'jobs', nextTab: null },
];

for (const f of files) {
  const file = `/Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/app/(dashboard)/[brandId]/cc/${f.path}`;
  let code = fs.readFileSync(file, 'utf8');

  const prodStart = code.indexOf('{activeTab === "products" && (');
  const blogsStart = code.indexOf('{activeTab === "blogs" && (');
  const faqsStart = code.indexOf('{activeTab === "faqs" && (');
  const catStart = code.indexOf('{activeTab === "categories" && (');
  const helpStart = code.indexOf('{activeTab === "help" && (');
  const jobsStart = code.indexOf('{activeTab === "jobs" && (');
  
  const starts = {
    'products': prodStart,
    'blogs': blogsStart,
    'faqs': faqsStart,
    'categories': catStart,
    'help': helpStart,
    'jobs': jobsStart,
    null: code.lastIndexOf('</Card>')
  };

  if (prodStart !== -1) {
    const prefix = code.substring(0, prodStart);
    const startIdx = starts[f.tab];
    const endIdx = starts[f.nextTab];
    
    let content = code.substring(startIdx, endIdx);
    content = content.replace(`{activeTab === "${f.tab}" && (`, '');
    content = content.substring(0, content.lastIndexOf(')}'));
    
    const suffix = code.substring(code.lastIndexOf('</Card>'));
    
    fs.writeFileSync(file, prefix + content + suffix);
    console.log(`${f.tab} fixed`);
  }
}
