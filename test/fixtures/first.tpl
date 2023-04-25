{% extends "_layout.tpl" %}
{% block main %}
  <h1>First Template</h1>
  <p>{{ a }}</p>
  <p class="{{ template.slug }}">Amazing</p>
{% endblock %}