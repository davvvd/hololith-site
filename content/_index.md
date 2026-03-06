---
# Leave the homepage title empty to use the site title
title:
date: 2022-10-24
type: landing

sections:
  - block: hero
    content:
      title: |
        HoloLith Group
      image:
        filename: welcome.jpg
      text: |
        Research in holographic lithography, advanced optics, and functional materials.

  - block: people
    content:
      title: Meet the Team
      subtitle: People behind HoloLith
      
      user_groups:
        - Principal Investigators
        - Researchers
        - PhD Students
        - Visitors
      sort_by: Params.last_name
      sort_ascending: true
      text: |
        {{% cta cta_link="./people/" cta_text="Explore the team" %}}
    design:
      show_interests: false
      show_role: true
      show_social: true


  - block: collection
    content:
      title: Projects
      subtitle: ''
      text: |
      filters:
        folders:
          - projects
        
    design:
      view: card
      columns: '3'
      css_class: projects-grid
      spacing:
        padding: ['30px', '0', '20px', '0']

  

  - block: collection
    content:
      title: Latest News
      subtitle:
      text:
      count: 5
      filters:
        author: ''
        category: ''
        exclude_featured: false
        publication_type: ''
        tag: ''
      offset: 0
      order: desc
      page_type: post
    design:
      view: card
      columns: '2'
      css_class: latest-news-grid

  - block: collection
    content:
      title: Latest Preprints
      subtitle:
      text: ""
      count: 5
      filters:
        folders:
          - publication
        publication_type: 'article'
    design:
      view: citation
      columns: '2'

---
