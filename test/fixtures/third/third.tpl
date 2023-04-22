{% fm %}
{ 
    "message": "hello mars!"
}
{% endfm %}
{% extends "../_layout.tpl" %}
{% block main %}
  <h1>Third Template</h1>
  <p>{{ message }}</p>
{% endblock %}