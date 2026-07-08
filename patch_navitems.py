import re

with open('Tenant_Backend/src/main/java/com/datamigratepro/seeder/DevDatabaseSeeder.java', 'r') as f:
    content = f.read()

# Replace new SiteSetting.NavItem("Products", "/products") with 
# new SiteSetting.NavItem("Products", "/products", null, true, null)

content = content.replace(
    'new SiteSetting.NavItem("Products", "/products")',
    'new SiteSetting.NavItem("Products", "/products", null, true, null)'
)
content = content.replace(
    'new SiteSetting.NavItem("Pricing", "/pricing")',
    'new SiteSetting.NavItem("Pricing", "/pricing", null, true, null)'
)
content = content.replace(
    'new SiteSetting.NavItem("Help Center", "/help")',
    'new SiteSetting.NavItem("Help Center", "/help", null, true, null)'
)
content = content.replace(
    'new SiteSetting.NavItem("Careers", "/careers")',
    'new SiteSetting.NavItem("Careers", "/careers", null, true, null)'
)
content = content.replace(
    'new SiteSetting.NavItem("Contact", "/contact")',
    'new SiteSetting.NavItem("Contact", "/contact", null, true, null)'
)

# Wait, `setNavigation` doesn't exist on `SiteSetting`? I might have meant `setMainNavigation`.
# Let's check the compiler error again. It only complained about NavItem constructor.
# But let me double check if `setNavigation` is valid.
# SiteSetting has `private List<NavItem> mainNavigation;` so it should be `setMainNavigation`.

content = content.replace(
    'setting.setNavigation(Arrays.asList(',
    'setting.setMainNavigation(Arrays.asList('
)

with open('Tenant_Backend/src/main/java/com/datamigratepro/seeder/DevDatabaseSeeder.java', 'w') as f:
    f.write(content)

