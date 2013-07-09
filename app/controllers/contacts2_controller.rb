class Contacts2Controller < ApplicationController

  # controller that uses active model serializer. Basically the json format
  # required by Ember data is different than was is required by angular's $resource

  def index
    @contacts = Contact.all
    puts @contacts
    render json: @contacts
  end

  def show
    @contact = Contact.find(params[:id])
    render json: @contact
  end

  def create
    @contact = Contact.new(params[:contact])
    @contact.save
    render json: @contact
  end

  def update
    @contact = Contact.find(params[:id])
    @contact.update_attributes(params[:contact])
    head :no_content
  end

  def destroy
    @contact = Contact.find(params[:id])
    @contact.destroy
    head :no_content
  end
end