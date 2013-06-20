class Contact < ActiveRecord::Base
  attr_accessible :active, :age, :first_name, :last_name, :contact_type
end
