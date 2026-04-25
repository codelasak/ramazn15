#!/usr/bin/env ruby
# Add PrivacyInfo.xcprivacy to the App target's bundle resources.
require "xcodeproj"

PROJECT_PATH = File.expand_path("../App.xcodeproj", __dir__)
RELATIVE_PATH = "App/PrivacyInfo.xcprivacy"
TARGET_NAME   = "App"

project = Xcodeproj::Project.open(PROJECT_PATH)

target = project.targets.find { |t| t.name == TARGET_NAME }
abort("Target #{TARGET_NAME} not found") unless target

# Already added?
already = target.resources_build_phase.files.any? do |f|
  f.file_ref && f.file_ref.path&.end_with?("PrivacyInfo.xcprivacy")
end

if already
  puts "PrivacyInfo.xcprivacy already in resources build phase. Nothing to do."
  exit 0
end

app_group = project.main_group["App"] || project.main_group.find_subpath("App", true)
file_ref = app_group.find_file_by_path("PrivacyInfo.xcprivacy")
file_ref ||= app_group.new_reference("PrivacyInfo.xcprivacy")
file_ref.last_known_file_type = "text.xml"

target.resources_build_phase.add_file_reference(file_ref)
project.save

puts "Added #{RELATIVE_PATH} to #{TARGET_NAME} resources build phase."
