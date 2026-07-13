const fs = require('fs');

const files = [
  'products/page.tsx',
  'blogs/page.tsx',
  'faqs/page.tsx',
  'categories/page.tsx',
  'help/page.tsx',
  'careers/page.tsx',
];

for (const path of files) {
  const file = `/Users/akashsahu.blue/Documents/Akas/software-selling-platform/Tenant_Frontend_Admin/app/(dashboard)/[brandId]/cc/${path}`;
  let code = fs.readFileSync(file, 'utf8');

  // Find the last </Table>
  const lastTableIdx = code.lastIndexOf('</Table>');
  if (lastTableIdx !== -1) {
    const prefix = code.substring(0, lastTableIdx + '</Table>'.length);
    const suffix = `
          </div>
        </Card>
      {/* QUICK LINKS MODAL */}
    </div>
  );
}
`;
    fs.writeFileSync(file, prefix + suffix);
    console.log(`${path} fixed`);
  }
}
