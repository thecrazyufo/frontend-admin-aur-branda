const fs = require('fs');

const file = '/Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/app/(dashboard)/[brandId]/cc/categories/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Find the start of {activeTab === "products" && (
const prodStart = code.indexOf('{activeTab === "products" && (');
const blogsStart = code.indexOf('{activeTab === "blogs" && (');
const faqsStart = code.indexOf('{activeTab === "faqs" && (');
const catStart = code.indexOf('{activeTab === "categories" && (');
const helpStart = code.indexOf('{activeTab === "help" && (');
const jobsStart = code.indexOf('{activeTab === "jobs" && (');
const endDiv = code.lastIndexOf('</div>'); // The end of the main card body

if (prodStart !== -1 && jobsStart !== -1) {
  // we want to keep categories!
  const prefix = code.substring(0, prodStart);
  const catEnd = helpStart;
  let catContent = code.substring(catStart, catEnd);
  // remove the wrapper: {activeTab === "categories" && (   and the closing )}
  catContent = catContent.replace('{activeTab === "categories" && (', '');
  catContent = catContent.substring(0, catContent.lastIndexOf(')}'));
  
  const suffix = code.substring(code.lastIndexOf('</Card>'));
  
  fs.writeFileSync(file, prefix + catContent + suffix);
  console.log("Categories fixed");
}
