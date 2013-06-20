class CreateContacts < ActiveRecord::Migration
  def change
    create_table :contacts do |t|
      t.string :first_name
      t.string :last_name
      t.string :contact_type
      t.boolean :active
      t.integer :age

      t.timestamps
    end
  end
end
