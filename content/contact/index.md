---
title: Contact
date: 2022-10-24

type: landing

sections:
  - block: contact
    content:
      title: Contact
      text: |-
        For collaborations, student opportunities, and project inquiries, contact the HoloLith group.
      email: stefanoluigi.oscurato@unina.it
      phone: ''
      address:
        street: University of Naples Federico II
        city: Naples
        region: NA
        postcode: '80125'
        country: Italy
        country_code: IT
      coordinates:
        latitude: '40.8518'
        longitude: '14.2681'
      directions: Contact us by email to schedule a meeting.
      office_hours:
        - 'By appointment'
      appointment_url: ''
      #contact_links:
      #  - icon: comments
      #    icon_pack: fas
      #    name: Discuss on Forum
      #    link: 'https://discourse.gohugo.io'
    
      # Automatically link email and phone or display as text?
      autolink: true
    
      # Email form provider
      form:
        provider: netlify
        formspree:
          id:
        netlify:
          # Enable CAPTCHA challenge to reduce spam?
          captcha: false
    design:
      columns: '1'

  - block: markdown
    content:
      title:
      subtitle: ''
      text:
    design:
      columns: '1'
      background:
        image: 
          filename: contact.jpg
          filters:
            brightness: 1
          parallax: false
          position: center
          size: cover
          text_color_light: true
      spacing:
        padding: ['20px', '0', '20px', '0']
      css_class: fullscreen
---
