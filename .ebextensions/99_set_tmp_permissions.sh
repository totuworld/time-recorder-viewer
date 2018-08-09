files:
  "/opt/elasticbeanstalk/hooks/appdeploy/pre/99_set_tmp_permissions.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/usr/bin/env bash
      chown -R ec2-user /tmp