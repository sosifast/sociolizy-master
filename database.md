1.user
id
uuid
username
email
password
balance
level (Member, Admin)
api_key
create_at
update_at

2.api_profider
id
name
slug
api_key
balance
create_at
update_at

3.platform
id
uiid
name
slug
icon
create_at
update_at

4.category
id
uiid
id_platform
name
slug
description
icon
create_at
update_at

5.services
id
uuid
id_category
service_name
slug
service_id
min
max
desc
rate_api
reate_sale
create_at
update_at


6.setting
id
site_name
favicon
logo
api_app
create_at
update_at