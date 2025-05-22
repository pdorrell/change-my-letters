;; Project values

(load-this-project
 `( (:project-type typescript)
    (:project-name "change-my-letters")
    (:alternate-file-or-dir-command (other-window base-dir "run-npm-test" this-file-or-dir ("NPM_TEST" . file)))
    ) )
