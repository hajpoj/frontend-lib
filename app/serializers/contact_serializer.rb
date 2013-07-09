class ContactSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :age, :contact_type, :active
end
